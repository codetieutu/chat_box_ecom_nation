import { Markup } from "telegraf";
import { isAdmin, addAdmin } from "../../utils/userUtil.js";

export default (bot) => {
    bot.command("admin", async (ctx) => {
        const userId = ctx.from.id;

        if (await isAdmin(userId)) {
            // console.log(">>check isadmin", isAdmin(userId));
            await ctx.reply("✅ welcome admin!", adminMenu());
        } else {
            // ❌ Nếu chưa là admin → yêu cầu nhập mật khẩu
            ctx.session = ctx.session || {};
            ctx.session.step = "waiting_password";
            // ctx.session.userId = userId;
            await ctx.reply("🔐 Please enter the administrator password:");
        }
    });

    // Khi bấm nút trong menu admin
    bot.action("ADMIN_PRODUCTS", async (ctx) => {
        await ctx.answerCbQuery();
        await ctx.editMessageText("📦 *Quản lý sản phẩm*", {
            parse_mode: "Markdown",
            reply_markup: {
                inline_keyboard: [
                    [Markup.button.callback("➕ Add product", "ADMIN_ADD_PRODUCT")],
                    [Markup.button.callback("📋 List product", "SHOW_ADMIN_PRODUCTS_0")],
                    [Markup.button.callback("🔙 Back", "ADMIN_HOME")],
                ],
            },
        });
    });

    bot.action("ADMIN_HOME", async (ctx) => {
        await ctx.answerCbQuery();
        await ctx.editMessageText("🏠 *Menu Admin*", adminMenu());
    });
};

// Hàm tạo giao diện menu admin
const adminMenu = () => {
    return {
        parse_mode: "Markdown",
        reply_markup: {
            inline_keyboard: [
                [
                    Markup.button.callback("📦 Manager product", "ADMIN_PRODUCTS"),
                    Markup.button.callback("👥 Manager user", "ADMIN_USERS"),
                ], [
                    Markup.button.callback("📋 Manager order", "ADMIN_ORDERS_0")
                ]
                // [Markup.button.callback("❌ Exit", "SHOW_HOME")],
            ],
        },
    };
}

export {
    adminMenu
}
