import { Markup } from "telegraf";
import { addUser, getUserById } from "../../utils/userUtil.js";
import path from "path";

const showMenu = async (ctx, u, edit = false, media = false) => {
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
            Markup.button.callback("📦 All Products", "SHOW_USER_PRODUCTS_0"),
            // Markup.button.callback("💎 Premium Apps", "PREMIUM_APPS"),
        ],
        [
            // Markup.button.callback("🤖 Bot Info", "BOT_INFO"),
            Markup.button.callback("💰 Deposit", "DEPOSIT"),
        ],
    ]);

    if (edit) {
        if (media) {
            await ctx.editMessageMedia(
                {
                    type: "photo",
                    media: { source: logoPath },
                    caption: caption, // tuỳ chọn
                    parse_mode: "Markdown",
                },
                {
                    // reply_markup: keyboard.reply_markup, // hoặc ...keyboard nếu bạn đã dùng Markup.inlineKeyboard()
                    ...keyboard,
                }
            );
        } else
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
        const { id, is_bot, first_name, last_name, username = "no-username", language_code } = ctx.from;
        console.log(ctx.from);
        const balance = 0;
        const is_block = false;
        const transaction = 0;
        const user = {
            id,
            is_bot,
            first_name,
            last_name,
            username,
            language_code,
            balance,
            is_block,
            transaction
        }
        const u = await addUser(user);
        // ╰ ID : \`${user.id}\`
        // * BOT Statistic:*
        // ╰ Produk Terjual: 165, 882 Akun
        // ╰ Total User: 1809

        showMenu(ctx, user);

    });

    bot.action("SHOW_HOME", async (ctx) => {
        const { id } = ctx.from;
        const user = await getUserById(id);
        showMenu(ctx, user, true);
    })
    bot.action("SHOW_HOME_MEDIA", async (ctx) => {
        const { id } = ctx.from;
        const user = await getUserById(id);
        showMenu(ctx, user, true, true);
    })

};

export {
    showMenu
}
