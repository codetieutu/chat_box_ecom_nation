import { getProductById } from "../../utils/productUtil.js";
import { payment } from "../payment.js";

export default (bot) => {
    bot.action(/PAYMENT_(\d+)/, async (ctx) => {
        await ctx.answerCbQuery();

        const userId = ctx.from.id;
        const variantId = Number(ctx.match[1]);

        ctx.session ??= {};
        const variant = ctx.session.product;
        const product = await getProductById(variant.productId);

        const quantity = Number(variant.currenQuan);
        const unitPrice = Number(variant.price);
        const totalPayment = quantity * unitPrice;

        // 1️⃣ Tạo QR thanh toán PayOS
        const orderCode = await payment(ctx, totalPayment);

        if (!orderCode) {
            return ctx.reply("❌ Không tạo được QR thanh toán.");
        }

        // 2️⃣ Lưu order pending TẠM THỜI (không lưu DB)
        global.pendingOrders ??= {};
        global.pendingOrders[orderCode] = {
            userId,
            variantId,
            productId: product.id,
            quantity,
            totalPayment
        };

        await ctx.reply("🕒 Vui lòng thanh toán để tiến hành giao hàng.");
    });
};
