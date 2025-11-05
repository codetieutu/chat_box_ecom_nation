export default (bot) => {
    bot.action(/UPLOAD_STOCK_(\d+)/, async (ctx) => {
        await ctx.answerCbQuery();
        const productId = ctx.match[1];
        ctx.session = ctx.session || {};
        ctx.session.targetProduct = productId;
        ctx.session.step = "upload_stock";
        await ctx.reply(`📝 Please send file *TXT*`, {
            parse_mode: "Markdown",
        });
    })
}