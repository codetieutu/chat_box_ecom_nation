import { Markup } from "telegraf";
import { getProducts } from "../../../utils/product.js";

const showProducts = async (ctx) => {
    const products = await getProducts();
    let text = "📋 *PRODUCT LIST:* \n";

    products.forEach((p, i) => {
        text += `${i + 1}. ${p.name} — ${p.price.toLocaleString()}đ (available: ${p.stock})\n`;
    });

    await ctx.editMessageText(text, {
        parse_mode: "Markdown",
        ...Markup.inlineKeyboard([
            ...products.map((p) => [Markup.button.callback(p.name, `buy_${p.id}`)]),
            [Markup.button.callback("🔄 refresh", "show_products")]
        ])
    });
}

export default (bot) => {
    // Khi bấm nút "SẢN PHẨM"
    bot.action("show_products", async (ctx) => {
        await ctx.answerCbQuery();
        await showProducts(ctx);
    });


};

export {
    showProducts
}
