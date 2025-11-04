import { isAdmin } from "../../../utils/userUtil.js";
export default (bot) => {
    bot.action("ADMIN_ADD_PRODUCT", async (ctx) => {
        await ctx.answerCbQuery();

        // Optional: permission check
        if (!(await isAdmin(ctx.from.id))) {
            await ctx.reply("🚫 You don't have permission to perform this action.");
            return;
        }

        ctx.session = ctx.session || {};
        ctx.session.step = "add_product_name";
        ctx.session.newProduct = {};

        await ctx.reply("🏷️ Please enter the *product name*:", {
            parse_mode: "Markdown",
        });
    });

    bot.action(/PRODUCT_TYPE_(.+)/, async (ctx) => {
        await ctx.answerCbQuery();

        const type = ctx.match[1];
        ctx.session.newProduct.type = type;
        ctx.session.step = "add_product_description";

        await ctx.reply("📝 Please enter the *product description*:", {
            parse_mode: "Markdown",
        });
    });
}