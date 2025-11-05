import { Markup } from "telegraf";
import { getOrdersByPage } from "../../../utils/orderUtil.js";

const showOrders = async (ctx, page = 0, edit = true) => {
    try {
        const limit = 10;
        const { orders, total } = await getOrdersByPage(page, limit);
        const totalPages = Math.ceil(total / limit);

        if (!orders.length) {
            if (edit) {
                await ctx.editMessageText("📭 No orders found.", {
                    parse_mode: "Markdown",
                    reply_markup: {
                        inline_keyboard: [
                            [Markup.button.callback("↩️ Back", "ADMIN_HOME")]
                        ]
                    }
                });
            } else {
                await ctx.reply("📭 No orders found.", {
                    parse_mode: "Markdown",
                    reply_markup: {
                        inline_keyboard: [
                            [Markup.button.callback("↩️ Back", "ADMIN_HOME")]
                        ]
                    }
                });
            }

            return;
        }

        // 📋 Format danh sách đơn hàng
        let text = `📦 *ORDER LIST (Page ${page + 1}/${totalPages}):*\n\n`;
        orders.forEach((o, i) => {
            text += `${i + 1 + page * limit}. *${o.product_name}*\n`;
            // text += `╰ 👤 User: \`${o.user_id}\`\n`;
            text += `╰ 💰 Total: ${o.total_price}$ | Qty: ${o.quantity}\n`;
            // text += `╰ ✅ Completed: ${o.is_completed ? "Yes" : "No"}\n\n`;
        });

        // 🔘 Tạo nút điều hướng trang
        const buttons = [];

        // Tạo 5 nút mỗi hàng
        for (let i = 0; i < orders.length; i += 5) {
            const rowButtons = orders.slice(i, i + 5).map((o, idx) =>
                Markup.button.callback(`${i + idx + 1}`, `ORDER_${o.id}`)
            );
            buttons.push(rowButtons);
        }

        // Các nút điều hướng
        const navButtons = [];
        if (page > 0) navButtons.push(Markup.button.callback("⏮ Prev", `ADMIN_ORDERS_${page - 1}`));
        if (page < totalPages - 1) navButtons.push(Markup.button.callback("⏭ Next", `ADMIN_ORDERS_${page + 1}`));

        // Nếu có nút điều hướng, thêm thành 1 hàng riêng
        if (navButtons.length) buttons.push(navButtons);

        // Nút back riêng 1 hàng
        buttons.push([Markup.button.callback("↩️ Back", "ADMIN_HOME")]);

        // Hiển thị danh sách
        console.log(">>check edit", edit);
        if (edit) {
            await ctx.editMessageText(text, {
                parse_mode: "Markdown",
                reply_markup: { inline_keyboard: buttons },
            });
        } else {
            await ctx.reply(text, {
                parse_mode: "Markdown",
                reply_markup: { inline_keyboard: buttons },
            });
        }

    } catch (err) {
        console.error("⚠️ showOrders error:", err);
        await ctx.reply("❌ Failed to load orders list.");
    }
};

export default (bot) => {
    // Khi chuyển trang (Admin)
    bot.action(/ADMIN_ORDERS_(\d+)/, async (ctx) => {
        await ctx.answerCbQuery();
        const page = parseInt(ctx.match[1]);
        await showOrders(ctx, page);
    });
};

export {
    showOrders
}
