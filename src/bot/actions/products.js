import { Markup } from "telegraf";
import { getProducts } from "../../utils/product.js";

const showProducts = async (ctx) => {
    try {
        const totalPages = Math.ceil(products.length / PAGE_SIZE);
        const start = page * PAGE_SIZE;
        const end = start + PAGE_SIZE;
        const visibleProducts = products.slice(start, end);

        // ==== Tạo text hiển thị ====
        let text = `📋 *PRODUCT LIST (Page ${page + 1}/${totalPages}):*\n\n`;
        visibleProducts.forEach((p, i) => {
            text += `${start + i + 1}. ${p.name} — ${p.price.toLocaleString()}đ (stock: ${p.stock})\n`;
        });

        // ==== Tạo nút chọn sản phẩm (5 cột / hàng) ====
        const buttonRows = [];
        for (let i = 0; i < visibleProducts.length; i += 5) {
            const rowButtons = visibleProducts.slice(i, i + 5).map((p, idx) =>
                Markup.button.callback(`${start + i + idx + 1}`, `buy_${p.id}`)
            );
            buttonRows.push(rowButtons);
        }

        // ==== Điều hướng trang ====
        const navButtons = [];
        if (page > 0) navButtons.push(Markup.button.callback("⏮ Prev", `products_page_${page - 1}`));
        if (page < totalPages - 1) navButtons.push(Markup.button.callback("⏭ Next", `products_page_${page + 1}`));
        navButtons.push(Markup.button.callback("🔄 Refresh", `show_products`));
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
    bot.action("ALL_PRODUCTS", async (ctx) => {
        await ctx.answerCbQuery();
        await showProducts(ctx);
    });


};

export {
    showProducts
}
