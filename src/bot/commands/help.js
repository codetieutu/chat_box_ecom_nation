import { Markup } from "telegraf";

export default (bot) => {
    bot.command("help", (ctx) => {
        ctx.reply(
            "🧭 *Hướng dẫn sử dụng bot KID CAPCUT*\n\n" +
            "Dưới đây là các lệnh mà bạn có thể dùng:\n" +
            "━━━━━━━━━━━━━━━━━━━\n" +
            "💡 /start – Khởi động bot, xem menu chính\n" +
            
            "❓ /help – Hiển thị hướng dẫn này\n\n" +
            "📞 Hỗ trợ: @Kidkaitoo",
            {
                parse_mode: "Markdown",
                ...Markup.inlineKeyboard([
                    [Markup.button.callback("⬅️ Quay lại menu", "go_home")],
                ]),
            }
        );
    });

    // Khi người dùng bấm "⬅️ Quay lại menu"
    bot.action("go_home", (ctx) => {
        ctx.reply(
            "🏠 Quay lại menu chính:",
            Markup.inlineKeyboard([
                [Markup.button.callback("🛒 SẢN PHẨM", "show_products")],
            ])
        );
    });
};
