import { Markup } from "telegraf";
import fs from "fs/promises";
import path from "path";
// import { addUser } from "../../utils/userutil";

export default (bot) => {
    const logoPath = path.join(process.cwd(), "assets/logo.png");
    bot.start(async (ctx) => {
        const user = ctx.from;
        const date = new Date().toLocaleString("id-ID", {
            weekday: "long",
            day: "2-digit",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        });


        const keyboard = Markup.inlineKeyboard([
            [
                Markup.button.callback("📦 All Products", "ALL_PRODUCTS"),
                Markup.button.callback("💎 Premium Apps", "PREMIUM_APPS"),
            ],
            [
                Markup.button.callback("🤖 Bot Info", "BOT_INFO"),
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

    // === Xử lý các nút callback ===
    bot.action("ALL_PRODUCTS", async (ctx) => {
        await ctx.editMessageText(
            "🛍️ *Danh sách sản phẩm sẽ được hiển thị tại đây...*",
            {
                parse_mode: "Markdown",
                reply_markup: Markup.inlineKeyboard([
                    [Markup.button.callback("⬅️ Quay lại", "BACK_HOME")],
                ]),
            }
        );
    });

};
