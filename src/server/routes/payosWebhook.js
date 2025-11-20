import express from "express";
import { payos } from "../bot/utils/payosUtil.js";
import { getProductByQuantity } from "../utils/stockUtil.js";
import { exportProductsToTxt } from "../bot/export.js";

const router = express.Router();

router.post("/payos/webhook", async (req, res) => {
    try {
        const data = await payos.webhooks.verify(req.body);

        if (data.code !== "PAYMENT_SUCCESS") {
            return res.json({ message: "ignored" });
        }

        const { orderCode } = data.data;

        // Lấy order pending
        const pending = global.pendingOrders?.[orderCode];
        if (!pending) {
            console.log("❌ Không tìm thấy orderCode:", orderCode);
            return res.json({ message: "no_order" });
        }

        const { userId, variantId, quantity } = pending;

        // 1️⃣ Lấy stock để giao hàng
        const stocks = await getProductByQuantity(variantId, quantity);

        if (!stocks || stocks.length < quantity) {
            return res.json({ message: "not_enough_stock" });
        }

        // 2️⃣ Gửi file txt cho user
        await exportProductsToTxt({ userId }, stocks);

        // 3️⃣ Xóa order pending
        delete global.pendingOrders[orderCode];

        console.log("🎉 Đã giao hàng cho user:", userId);

        return res.json({ message: "done" });

    } catch (err) {
        console.error("Webhook error:", err);
        res.json({ message: "error" });
    }
});

export default router;
