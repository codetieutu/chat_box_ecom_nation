import { Buffer } from "node:buffer";
// import { payos } from "../utils/payosUtil.js";
import { PayOS } from "@payos/node";
import dotenv from "dotenv";
import QRCode from 'qrcode'
dotenv.config();
import { HOST, PORT } from "../utils/env.js";
const payos = new PayOS({
    clientId: process.env.PAYOS_CLIENT_ID,
    apiKey: process.env.PAYOS_API_KEY,
    checksumKey: process.env.PAYOS_CHECKSUM_KEY,
});

export async function payment(ctx, totalPayment) {
    try {
        const userId = ctx.from.id;

        const amount = Number.parseInt(totalPayment, 10);
        if (!Number.isFinite(amount) || amount <= 0) {
            throw new Error("Số tiền thanh toán không hợp lệ");
        }

        const orderCode = Number(String(Date.now()).slice(-9));
        const description = `PAY_${userId}_${Math.random()
            .toString(36)
            .slice(2, 7)
            .toUpperCase()}`;

        const paymentLink = await payos.paymentRequests.create({
            orderCode,
            amount,
            description,
            returnUrl: `${HOST}:${PORT}/return`,
            cancelUrl: `$${HOST}:${PORT}/cancel`,
        });

        // console.log(">>> paymentLink:", paymentLink);

        const qrCode = paymentLink.qrCode; // Chuỗi EMVCo QR raw data

        try {
            // Tạo buffer hình ảnh từ chuỗi QR data
            const qrBuffer = await QRCode.toBuffer(qrCode, {
                width: 300,
                margin: 2,
                color: {
                    dark: '#000000',  // Màu đen cho điểm QR
                    light: '#FFFFFF'  // Màu trắng cho nền
                }
            });

            await ctx.replyWithPhoto(
                { source: qrBuffer },
                {
                    caption: `
💳 *Thanh toán đơn hàng*
Số tiền: *${amount.toLocaleString("vi-VN")} VND*
Nội dung: \`${description}\`

Quét mã QR để thanh toán.
            `,
                    parse_mode: "Markdown",
                }
            );

            return orderCode;
        } catch (error) {
            console.error('Lỗi tạo mã QR:', error);
            // Fallback: gửi mã code dạng text nếu tạo ảnh thất bại
            await ctx.reply(`
⚠️ *Không thể tạo mã QR ảnh*
Số tiền: *${amount.toLocaleString("vi-VN")} VND*
Nội dung: \`${description}\`

Mã thanh toán: \`${qrCode}\`
    `, { parse_mode: "Markdown" });

            return orderCode;
        }
    } catch (e) {
        console.error(">>> payment error:", e);
        return null;
    }
}

