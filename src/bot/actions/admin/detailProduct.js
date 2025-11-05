import { Markup } from "telegraf";
import { getProductById } from "../../../utils/productUtil.js";

const showAdminProduct = async (ctx, id, reply = false) => {
    try {
        const product = await getProductById(id);
        if (!product) {
            await ctx.reply("❌ Product not found.");
            return;
        }
        const desc = product.description ?? "_(no description)_";
        const text = `
🏷️ *${product.name}*
💰 Price: ${product.price}$
${product.type === "available" ? `📦 Stock: ${product.quantity}\n` : ""}📝 Description: ${desc}
`;


        const keyboard = Markup.inlineKeyboard([
            [
                Markup.button.callback("✏️ Edit Info", `EDIT_PRODUCT_${product.id}`),
                Markup.button.callback("🗑️ Delete", `DELETE_PRODUCT_${product.id}`)
            ],
            [Markup.button.callback("📤 Add Stock (via .txt)", `UPLOAD_STOCK_${product.id}`)],
            [Markup.button.callback("↩️ Back", "SHOW_ADMIN_PRODUCTS_0")],
        ]);
        if (reply)
            await ctx.reply(text, { parse_mode: "Markdown", ...keyboard });
        else
            await ctx.editMessageText(text, { parse_mode: "Markdown", ...keyboard });
    } catch (err) {
        console.error("⚠️ Error loading product:", err);
        await ctx.reply("❌ Failed to load product details.");
    }
}

export default (bot) => {
    bot.action(/ADMIN_PRODUCT_(\d+)/, async (ctx) => {
        await ctx.answerCbQuery();
        const productId = ctx.match[1];
        await showAdminProduct(ctx, productId);
    });
};

export {
    showAdminProduct,
}
