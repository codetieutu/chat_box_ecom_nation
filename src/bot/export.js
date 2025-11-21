import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

// Get absolute path (useful in ESM)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const exportProductsToTxt = async (telegramId, rows) => {
    try {
        if (!rows || rows.length === 0) {
            await bot.telegram.sendMessage(telegramId, "⚠️ Không có dữ liệu sản phẩm để gửi.");
            return;
        }

        // Tạo nội dung text
        const lines = rows
            .map((p, i) => {
                // Nếu có p.info thì dùng, không thì build từ các field khác
                if (p.info && p.info.trim() !== "") {
                    return `${i + 1}. ${p.info}`;
                }

                const name = p.name || p.product_name || "Sản phẩm không tên";
                const variant = p.variant_name ? ` | Variant: ${p.variant_name}` : "";
                const price = p.price != null ? ` | Giá: ${p.price}` : "";
                const quantity = p.quantity != null ? ` | SL: ${p.quantity}` : "";

                return `${i + 1}. ${name}${variant}${price}${quantity}`;
            })
            .filter(Boolean);

        const text = `📦 *Danh sách sản phẩm:*\n\n` + lines.join("\n");

        // Telegram giới hạn ~4096 ký tự / message → cắt nhỏ nếu cần
        const MAX_LEN = 4000;
        if (text.length <= MAX_LEN) {
            await bot.telegram.sendMessage(telegramId, text, { parse_mode: "Markdown" });
        } else {
            // Cắt thành nhiều đoạn
            for (let i = 0; i < text.length; i += MAX_LEN) {
                const chunk = text.slice(i, i + MAX_LEN);
                await bot.telegram.sendMessage(telegramId, chunk, { parse_mode: "Markdown" });
            }
        }
    } catch (err) {
        console.error("⚠️ sendProductsToUser error:", err);
        await bot.telegram.sendMessage(telegramId, "❌ Gửi danh sách sản phẩm thất bại.");
    }
};