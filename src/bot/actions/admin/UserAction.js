import { Markup } from "telegraf";
import { getUserById } from "../../../utils/userUtil.js";

export const showUserDetail = async (ctx, userId, edit = true) => {
    try {
        const user = await getUserById(userId);
        if (!user) {
            await ctx.answerCbQuery("❌ Không tìm thấy người dùng này!");
            return;
        }

        // 🧾 Tạo nội dung hiển thị
        const text = `
👤 *${user.first_name || ""} ${user.last_name || ""}*
╰ Username: @${user.username || "no_username"}

💰 *Balance:* ${user.balance}$
🛍️ *Transactions:* ${user.transaction}
`;

        // 🔘 Nút hành động
        const keyboard = Markup.inlineKeyboard([
            [Markup.button.callback("💰 Deposit", `DEPOSIT_USER_${user.id}`)],
            [Markup.button.callback("↩️ Back", "ADMIN_USERS")],
        ]);
        if (!edit) {
            await ctx.reply(text, { parse_mode: "Markdown", ...keyboard });
            return;
        }

        // Nếu message là ảnh → update caption, nếu không → update text
        const isPhoto = ctx.callbackQuery?.message?.photo;
        if (isPhoto) {
            await ctx.editMessageCaption(text, { parse_mode: "Markdown", ...keyboard });
        } else {
            await ctx.editMessageText(text, { parse_mode: "Markdown", ...keyboard });
        }

    } catch (error) {
        console.error("⚠️ showUserDetail error:", error);
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

}
