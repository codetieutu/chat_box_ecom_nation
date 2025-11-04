import { Markup } from "telegraf";
import { addUser, getUserById } from "../../utils/userUtil.js";
import path from "path";

const showHone = async (ctx, u, isEdit = false) => {
    const logoPath = path.join(process.cwd(), "assets/logo.png");

    const caption = `
👋 — *Hello ${u.first_name} ${u.last_name || ""}* 🛠️

*User Details :*
╰ Username : @${u.username || "no username"}
╰ Balance : ${u.balance} $
╰ Transaction : ${u.transaction}

`;
    const keyboard = Markup.inlineKeyboard([
        [
            Markup.button.callback("📦 All Products", "SHOW_PRODUCTS_0"),
            // Markup.button.callback("💎 Premium Apps", "PREMIUM_APPS"),
        ],
        [
            // Markup.button.callback("🤖 Bot Info", "BOT_INFO"),
            Markup.button.callback("💰 Deposit", "DEPOSIT"),
        ],
    ]);

    if (isEdit) {
        // Nếu đang ở trong callback → edit caption thay vì gửi tin mới
        await ctx.editMessageCaption(caption, {
            parse_mode: "Markdown",
            ...keyboard,
        });
    } else {
        // Khi /start → gửi tin nhắn mới
        await ctx.replyWithPhoto(
            { source: logoPath },
            {
                caption,
                parse_mode: "Markdown",
                ...keyboard,
            }
        );
    }
}

export default (bot) => {
    bot.start(async (ctx) => {
        const { id, is_bot, first_name, last_name, username, language_code } = ctx.from;
        const balance = 0;
        const block = false;
        const transaction = 0;
        const user = {
            id,
            is_bot,
            first_name,
            last_name,
            username,
            language_code,
            balance,
            block,
            transaction
        }
        const u = await addUser(user);
        // ╰ ID : \`${user.id}\`
        // * BOT Statistic:*
        // ╰ Produk Terjual: 165, 882 Akun
        // ╰ Total User: 1809

        showHone(ctx, user);

    });

    bot.action("SHOW_HOME", async (ctx) => {
        const { id } = ctx.from;
        const user = await getUserById(id);
        showHone(ctx, user, true);
    })
};
