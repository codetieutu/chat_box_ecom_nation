import { Markup } from "telegraf";
import { getUserById } from "../../../utils/userUtil.js";

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

export const showUserDetail = async (ctx, userId, edit = true) => {
    try {
        const user = await getUserById(userId);
        if (!user) {
            await ctx.answerCbQuery("❌ Không tìm thấy người dùng này!");
            return;
        }

        // 🧾 Tạo nội dung hiển thị với HTML formatting
        const fullName = `${escapeHtml(user.first_name || "")} ${escapeHtml(user.last_name || "")}`.trim();
        const username = user.username ? `@${escapeHtml(user.username)}` : "no_username";

        const text = `
👤 <b>${fullName}</b>
╰ Username: ${username}

💰 <b>Balance:</b> ${user.balance}$
🛍️ <b>Transactions:</b> ${user.transaction}
`.trim();

        // 🔘 Nút hành động
        const keyboard = Markup.inlineKeyboard([
            [Markup.button.callback("💰 Deposit", `DEPOSIT_USER_${user.id}`)],
            [Markup.button.callback("↩️ Back", "ADMIN_USERS")],
        ]);

        const messageOptions = {
            parse_mode: "HTML",
            ...keyboard,
        };

        if (!edit) {
            await ctx.reply(text, messageOptions);
            return;
        }

        // Nếu message là ảnh → update caption, nếu không → update text
        const isPhoto = ctx.callbackQuery?.message?.photo;
        if (isPhoto) {
            await ctx.editMessageCaption(text, messageOptions);
        } else {
            await ctx.editMessageText(text, messageOptions);
        }

    } catch (error) {
        console.error("⚠️ showUserDetail error:", error);
        // Xử lý lỗi "message not modified"
        if (error.response?.error_code === 400 &&
            error.response.description.includes('message is not modified')) {
            return;
        }
        await ctx.answerCbQuery("❌ Có lỗi xảy ra!");
    }
};

// Khi admin chọn một user cụ thể
export default (bot) => {
    bot.action(/^USER_(\d+)/, async (ctx) => {
        await ctx.answerCbQuery();
        const userId = ctx.match[1];
        await showUserDetail(ctx, userId);
    });

    bot.action(/^DEPOSIT_USER_(\d+)/, async (ctx) => {
        await ctx.answerCbQuery();
        const userId = ctx.match[1];
        ctx.session = ctx.session || {};
        ctx.session.depositTarget = userId;   // lưu user đang nạp
        ctx.session.step = "waiting_deposit"; // đánh dấu bước hiện tại

        await ctx.reply("💵 Please enter the amount to deposit:");
    });
};