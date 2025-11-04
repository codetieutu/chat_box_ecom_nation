import { Markup } from "telegraf";
import { addUser } from "../../utils/userutil.js";
import path from "path";

export default (bot) => {
    const logoPath = path.join(process.cwd(), "assets/logo.png");
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


        const caption = `
👋 — *Hello ${u.first_name} ${u.last_name || ""}* 🛠️

*User Details :*
╰ Username : @${u.username || "no username"}
╰ Balance : ${u.balance} $
╰ Transaction : ${u.transaction}

`;
        const keyboard = Markup.inlineKeyboard([
            [
                Markup.button.callback("📦 All Products", "ALL_PRODUCTS"),
                // Markup.button.callback("💎 Premium Apps", "PREMIUM_APPS"),
            ],
            [
                // Markup.button.callback("🤖 Bot Info", "BOT_INFO"),
                Markup.button.callback("💰 Deposit", "DEPOSIT"),
            ],
        ]);

        await ctx.replyWithPhoto(
            { source: logoPath }, // thay link logo bạn muốn
            {
                caption,
                parse_mode: "Markdown",
                ...keyboard,
            }
        );
    });
};
