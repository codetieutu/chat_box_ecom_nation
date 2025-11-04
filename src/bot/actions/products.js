import { Markup } from "telegraf";
import { getProductByPage } from "../../utils/productUtil.js";

const showProducts = async (ctx, page) => {
    try {
        const { products, total } = await getProductByPage(page);
        // ==== Tạo text hiển thị ====
        let text = `📋 *PRODUCT LIST (Page ${page + 1}/${total}):*\n\n`;
        products.forEach((p, i) => {
            text += `${i + 1}. ${p.name} — ${p.price.toLocaleString()}$ (stock: ${p.quantity})\n`;
        });

        // ==== Tạo nút chọn sản phẩm (5 cột / hàng) ====
        const buttonRows = [];
        for (let i = 0; i < products.length; i += 5) {
            const rowButtons = products.slice(i, i + 5).map((p, idx) =>
                Markup.button.callback(`${i + idx + 1}`, `buy_${p.id}`)
            );
            buttonRows.push(rowButtons);
        }

        // ==== Điều hướng trang ====
        const navButtons = [];
        if (page > 0) navButtons.push(Markup.button.callback("⏮ Prev", `SHOW_PRODUCTS_${page - 1}`));
        if (page < total - 1) navButtons.push(Markup.button.callback("⏭ Next", `SHOW_PRODUCTS_${page + 1}`));
        navButtons.push(Markup.button.callback("↩️ Back", `SHOW_HOME`));
        buttonRows.push(navButtons);

        // ==== Gửi hoặc cập nhật caption ====
        if (ctx.callbackQuery?.message?.photo) {
            await ctx.editMessageCaption(text, {
                parse_mode: "Markdown",
                reply_markup: { inline_keyboard: buttonRows },
            });
        } else {
            await ctx.editMessageText(text, {
                parse_mode: "Markdown",
                reply_markup: { inline_keyboard: buttonRows },
            });
        }
    } catch (err) {
        console.error("⚠️ showProducts error:", err);
    }
}

export default (bot) => {
    // Khi bấm nút "SẢN PHẨM"
    bot.action(/SHOW_PRODUCTS_(\d+)/, async (ctx) => {
        await ctx.answerCbQuery();
        const page = Number(ctx.match[1]);
        await showProducts(ctx, page);
    });
};

export {
    showProducts
}
