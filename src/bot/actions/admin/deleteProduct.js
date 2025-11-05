import { deleteProduct } from "../../../utils/productUtil.js";
import { Markup } from "telegraf";
export default (bot) => {
    bot.action(/DELETE_PRODUCT_(\d+)/, async (ctx) => {
        await ctx.answerCbQuery();
        const productId = parseInt(ctx.match[1]);
        try {
            await deleteProduct(productId);
            await ctx.editMessageText("🗑️ Product have been deleted.", {
                parse_mode: "Markdown",
                reply_markup: {
                    inline_keyboard: [
                        [Markup.button.callback("↩️ Back", "SHOW_ADMIN_PRODUCTS_0")]
                    ]
                }
            });
        } catch (error) {
            console.log(">>check err", error);
            await ctx.reply("error in server");

        }
    })
}