import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

// Get absolute path (useful in ESM)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const exportProductsToTxt = async (ctx, rows) => {
    try {
        if (!rows || rows.length === 0) {
            await ctx.reply("⚠️ No product data to export.");
            return;
        }

        // 📝 Generate text content
        const lines = rows.map((p, i) => {
            // If p.info exists, use it — otherwise build from other fields
            if (p.info) return `${i + 1}. ${p.info}`;
        });

        const text = lines.join("\n");

        // 🗂️ Generate a temporary file path (include date to avoid overwriting)
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const filePath = path.join(__dirname, `../exports/products_${timestamp}.txt`);

        // Ensure export directory exists
        await fs.mkdir(path.dirname(filePath), { recursive: true });

        // Write file
        await fs.writeFile(filePath, text, "utf8");

        // 📤 Send to Telegram
        await ctx.replyWithDocument(
            { source: filePath },
            { caption: "📦 Product list exported successfully!" }
        );

        // Optional: cleanup the file after sending (to avoid storage buildup)
        setTimeout(async () => {
            try {
                await fs.unlink(filePath);
            } catch { }
        }, 5000);
    } catch (err) {
        console.error("⚠️ exportProductsToTxt error:", err);
        await ctx.reply("❌ Failed to export product list.");
    }
};
