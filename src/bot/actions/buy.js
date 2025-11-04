import { Markup } from "telegraf";
import { getProductById, getProducts } from "../../utils/product.js";
import { showProducts } from "./products.js";


export default (bot) => {

    bot.action(/buy_(.+)/, async (ctx) => {
        await ctx.answerCbQuery();
        const productId = ctx.match[1];
        const product = await getProductById(productId);
        if (!product) {
            await ctx.reply("❌ error, please try again");
            await showProducts(ctx);
            return;
        }
        ctx.session = ctx.session || {};
        ctx.session.selectedProduct = product;

        await ctx.reply(
            `👏 You have selected *${product.name}* — ${product.price.toLocaleString()} VND (Stock: ${product.stock})\n\n` +
            "👉 *Please enter the quantity you want to buy:*",
            { parse_mode: "Markdown" }
        );

    });

    // Nhận số lượng từ người dùng
    bot.on("text", async (ctx) => {
        const product = ctx.session.selectedProduct;
        if (!product) {
            ctx.reply("❌ error, please try again");
            return;
        }

        const qty = parseInt(ctx.message.text);
        if (isNaN(qty) || qty <= 0)
            return ctx.reply("❌ Please enter a valid quantity!");
        if (qty > product.stock)
            return ctx.reply("❌ Quantity exceeds available stock!");

        // Deduct stock and confirm order
        product.stock -= qty;
        await ctx.reply(
            `✅ You have successfully ordered *${product.name}* x${qty}!`,
            { parse_mode: "Markdown" }
        );


        ctx.session.selectedProduct = null;

    });

};
