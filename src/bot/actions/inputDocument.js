import fs from "fs/promises";
import path from "path";
import { addStock } from "../../utils/stockUtil.js";
import { showAdminProduct } from "./admin/detailProduct.js";

export default (bot) => {
    bot.on("document", async (ctx) => {
        ctx.session = ctx.session || {};

        if (ctx.session.step !== "upload_stock") return;

        const file = ctx.message.document;
        if (!file.file_name.endsWith(".txt")) {
            await ctx.reply("❌ Please upload a `.txt` file only.");
            return;
        }

        const fileLink = await ctx.telegram.getFileLink(file.file_id);
        const response = await fetch(fileLink.href);
        const text = await response.text();

        const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);

        // Example: each line is a new stock item
        const productId = ctx.session.targetProduct;
        const added = lines.length;

        for (const line of lines) {
            try {
                await addStock(productId, line);
            } catch (error) {
                console.error(error);
            }
        }

        await ctx.reply(`✅ Successfully added ${added} new items to the stock.`);
        await showAdminProduct(ctx, productId, true);

        // Reset session
        // ctx.session.step = null;
        // ctx.session.targetProduct = null;
    });
}

