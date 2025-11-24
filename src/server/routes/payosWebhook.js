import express from "express";
const router = express.Router();

import crypto from "crypto";
import { getOrderById, updateOrderStatus } from '../../utils/orderUtil.js';
import { getProductByQuantity } from '../../utils/stockUtil.js';
import { exportProductsToTxt } from '../../bot/export.js';

router.post("/payos/webhook", async (req, res) => {
    try {
        const body = req.body;
        res.status(200).send("ok");
        // console.log(">>> PAYOS WEBHOOK:", JSON.stringify(body, null, 2));

        // ======== 1. Lấy data & signature từ webhook =========
        const data = body.data;
        const signature = body.signature;

        if (!data || !signature) {
            console.error("❌ Thiếu data hoặc signature");
            return res.status(400).send("invalid webhook");
        }

        // ======== 2. Hàm sắp xếp key =========
        function sortObjByKey(object) {
            return Object.keys(object)
                .sort()
                .reduce((obj, key) => {
                    obj[key] = object[key];
                    return obj;
                }, {});
        }

        // ======== 3. Hàm chuyển object → query string theo chuẩn PayOS =========
        function convertObjToQueryStr(object) {
            return Object.keys(object)
                .filter((key) => object[key] !== undefined)
                .map((key) => {
                    let value = object[key];

                    if (value && Array.isArray(value)) {
                        value = JSON.stringify(
                            value.map((val) => sortObjByKey(val))
                        );
                    }

                    if ([null, undefined, "null", "undefined"].includes(value)) {
                        value = "";
                    }

                    return `${key}=${value}`;
                })
                .join("&");
        }

        // ======== 4. Tạo chuỗi để hash =========
        const sortedData = sortObjByKey(data);
        const dataQueryStr = convertObjToQueryStr(sortedData);

        // console.log(">>> dataQueryStr:", dataQueryStr);

        // ======== 5. Tạo signature bằng HMAC SHA256 =========
        const calculatedSignature = crypto
            .createHmac("sha256", process.env.PAYOS_CHECKSUM_KEY)
            .update(dataQueryStr)
            .digest("hex");

        // console.log(">>> calculatedSignature:", calculatedSignature);

        // ======== 6. So sánh chữ ký =========
        if (calculatedSignature !== signature) {
            console.error("❌ Signature không hợp lệ");
            return res.status(400).send("invalid signature");
        }

        // ======== 7. Xử lý thanh toán =========
        const { orderCode, amount, description, code, desc } = data;


        // Ở PayOS, code = '00' và desc = 'Thành công' tức là PAID
        if (code === "00" && desc == "success") {
            const order = await getOrderById(orderCode);
            const products = await getProductByQuantity(order.variant_id, order.quantity, order.id);
            await exportProductsToTxt(order.user_id, products);
            updateOrderStatus(order.id, "success")
        }
        return res.status(200).json({ error: 0, message: "Received" })

    } catch (err) {
        console.error("Webhook error:", err);
        res.status(500).send("server error");
    }
});

export default router;
