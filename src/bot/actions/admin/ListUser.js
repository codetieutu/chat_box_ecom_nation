import { Markup } from "telegraf";
import { getUsersByPage } from "../../../utils/userUtil.js";

// Hàm escape HTML an toàn
function escapeHtml(text) {
    if (!text) return '';
    return text.toString()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// === Hiển thị danh sách người dùng có phân trang ===
const showUsers = async (ctx, page = 0) => {
    try {
        // Lấy dữ liệu người dùng (mỗi trang 10 user)
        const { users, totalPages, totalUsers } = await getUsersByPage(page);

        let text = `<b>👥 USER LIST (Page ${page + 1}/${totalPages})</b>\n`;
        text += `<b>Total users:</b> ${totalUsers}\n\n`;

        users.forEach((u, i) => {
            const username = u.username ? escapeHtml(u.username) : "no username";
            text += `<b>${i + 1}.</b> @${username}\n`;
            text += `╰ Balance: ${u.balance}$ | Transactions: ${u.transaction}\n\n`;
        });

        // === Nút điều hướng ===
        const buttonRows = [];
        for (let i = 0; i < users.length; i += 5) {
            const rowButtons = users.slice(i, i + 5).map((u, idx) =>
                Markup.button.callback(`${i + idx + 1}`, `USER_${u.id}`)
            );
            buttonRows.push(rowButtons);
        }

        const navButtons = [];
        if (page > 0) navButtons.push(Markup.button.callback("⏮ Prev", `SHOW_USERS_${page - 1}`));
        if (page < totalPages - 1) navButtons.push(Markup.button.callback("⏭ Next", `SHOW_USERS_${page + 1}`));
        navButtons.push(Markup.button.callback("↩️ Back", "ADMIN_HOME"));

        buttonRows.push(navButtons);

        // === Gửi / Cập nhật tin nhắn ===
        const message = ctx.callbackQuery?.message;
        const opts = {
            parse_mode: "HTML",
            reply_markup: { inline_keyboard: buttonRows },
        };

        if (message?.photo) {
            await ctx.editMessageCaption(text, opts);
        } else {
            await ctx.editMessageText(text, opts);
        }
    } catch (err) {
        console.error("⚠️ showUsers error:", err);
        await ctx.answerCbQuery("❌ Lỗi khi tải danh sách người dùng!");
    }
};

// === Đăng ký action callback ===
export default (bot) => {
    bot.action(/SHOW_USERS_(\d+)/, async (ctx) => {
        await ctx.answerCbQuery();
        const page = Number(ctx.match[1]);
        await showUsers(ctx, page);
    });

    // Khi bấm nút "👥 Quản lý người dùng" trong menu admin
    bot.action("ADMIN_USERS", async (ctx) => {
        await ctx.answerCbQuery();
        await showUsers(ctx, 0);
    });
};

export { showUsers };