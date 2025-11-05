import { Markup } from "telegraf";
import { getProductById } from "../../utils/productUtil.js";
import { showProducts } from "./products.js";


export default (bot) => {

    bot.action(/BUY_PRODUCT_(\d+)/, async (ctx) => {
        await ctx.answerCbQuery();
        const productId = ctx.match[1];
        const product = await getProductById(productId);
        if (!product) {
            await ctx.reply("❌ error, please try again");
            await showProducts(ctx);
            return;
        }
        ctx.session = ctx.session || {};
        ctx.session.step = "wait_quantity";
        ctx.session.selectedProduct = product;

        await ctx.reply(
            `👏 You have selected *${product.name}* — ${product.price.toLocaleString()}$ ${product.type === "preorder" ? "(PreOrder)" : `(Stock: ${product.quantity}`})\n\n` +
            "👉 *Please enter the quantity you want to buy:*",
            { parse_mode: "Markdown" }
        );

    });

};
