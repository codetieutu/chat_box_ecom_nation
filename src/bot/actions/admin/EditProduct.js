import { Markup } from "telegraf";
import { getProductById } from "../../../utils/productUtil.js";

export default (bot) => {
    bot.action(/EDIT_PRODUCT_(\d+)/, async (ctx) => {
        await ctx.answerCbQuery();
        const productId = ctx.match[1];
        const product = await getProductById(productId);
        const text = `
🏷️ *${product.name}*
💰 *Price:* ${product.price}$
📦 *Stock:* ${product.quantity}
📝 *Description:* ${product.description}
`;
        ctx.session = ctx.session || {};
        ctx.session.step = "edit_product_field";
        ctx.session.targetProduct = productId;

        await ctx.editMessageText(
            text,
            Markup.inlineKeyboard([
                [Markup.button.callback("🏷️ Name", `EDIT_FIELD_name`)],
                [Markup.button.callback("💰 Price", `EDIT_FIELD_price`)],
                [Markup.button.callback("📝 Description", `EDIT_FIELD_description`)],
                [Markup.button.callback("↩️ Cancel", `ADMIN_PRODUCT_${productId}`)],
            ])
        );
    });
    bot.action(/EDIT_FIELD_(name|price|description)/, async (ctx) => {
        await ctx.answerCbQuery();
        const field = ctx.match[1];

        ctx.session = ctx.session || {};
        ctx.session.step = "editing_field";
        ctx.session.field = field;

        let fieldLabel = "";
        if (field === "name") fieldLabel = "product name";
        if (field === "price") fieldLabel = "product price";
        if (field === "description") fieldLabel = "product description";

        await ctx.reply(`📝 Please enter the new *${fieldLabel}*:`, {
            parse_mode: "Markdown",
        });
    });

}