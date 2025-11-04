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
                    [Markup.button.callback("➕ Thêm sản phẩm", "ADMIN_ADD_PRODUCT")],
                    [Markup.button.callback("📋 Danh sách sản phẩm", "SHOW_PRODUCTS_0")],
                    [Markup.button.callback("🔙 Quay lại", "ADMIN_HOME")],
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
                    Markup.button.callback("📦 Quản lý sản phẩm", "ADMIN_PRODUCTS"),
                    Markup.button.callback("👥 Quản lý người dùng", "ADMIN_USERS"),
                ],
                [Markup.button.callback("❌ Thoát", "ADMIN_EXIT")],
            ],
        },
    };
}

export {
    adminMenu
}
