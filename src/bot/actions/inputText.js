import { getUserById, updateUser, addAdmin } from "../../utils/userUtil.js";
import { showUserDetail } from "./admin/UserAction.js";
import { ADMIN_PASSWORD } from "../../utils/env.js";
import { adminMenu } from "../commands/admin.js";
import { Markup } from "telegraf";
import { addProduct } from "../../utils/productUtil.js";

const inputDeposit = async (ctx) => {
    const amount = parseFloat(ctx.message.text);
    if (isNaN(amount) || amount <= 0) {
        await ctx.reply("❌ Số tiền không hợp lệ, nhập lại:");
        return;
    }
    const userId = ctx.session.depositTarget;
    try {
        const user = await getUserById(userId);
        if (user) {
            const balance = parseFloat(user.balance) + amount
            await updateUser(userId, { balance });
            await ctx.reply(`💰 Deposited  ${amount}$ to user: ${user.username}`);
            ctx.session.step = null;
            ctx.session.depositTarget = null;
            await showUserDetail(ctx, userId, false);
        }
    } catch (error) {
        throw error;
    }

}

const inputPassword = async (ctx) => {
    const password = ctx.message.text.trim();
    if (password === ADMIN_PASSWORD) {
        await addAdmin(ctx.from.id);
        await ctx.reply("✅ Login success!", adminMenu());
    } else {
        await ctx.reply("❌ Wrong password, Please try again:");
        return;
    }
    ctx.session.step = null;
}

export default (bot) => {
    bot.on("text", async (ctx) => {
        ctx.session = ctx.session || {};

        const step = ctx.session.step;

        switch (step) {
            // === Nhập mật khẩu admin ===
            case "waiting_password": {
                inputPassword(ctx);
                break;
            }

            // === Nhập số tiền nạp ===
            case "waiting_deposit": {
                inputDeposit(ctx);
                break;
            }

            case "add_product_name": {
                ctx.session.newProduct.name = ctx.message.text.trim();
                ctx.session.step = "add_product_price";

                await ctx.reply("💰 Enter the *product price* (numbers only):", {
                    parse_mode: "Markdown",
                });
                break;
            }

            case "add_product_price": {
                const price = parseFloat(ctx.message.text.replace(/,/g, ""));
                if (isNaN(price) || price <= 0) {
                    await ctx.reply("❌ Invalid price. Please enter a valid number:");
                    return;
                }

                ctx.session.newProduct.price = price;
                ctx.session.step = "add_product_type";

                await ctx.reply(
                    "📦 Choose the *product type*: ",
                    Markup.inlineKeyboard([
                        [Markup.button.callback("✅ Available", "PRODUCT_TYPE_available")],
                        [Markup.button.callback("🕒 Preorder", "PRODUCT_TYPE_preorder")],
                    ])
                );
                break;
            }

            case "add_product_description": {
                ctx.session.newProduct.description = ctx.message.text.trim();

                const p = ctx.session.newProduct;
                try {
                    await addProduct(p);
                    await ctx.reply(
                        `✅ Product added successfully:\n\n🏷️ *${p.name}*\n💰 ${p.price}$\n📦 ${p.type}\n📝 ${p.description}`,
                        { parse_mode: "Markdown" }
                    );
                    await ctx.reply("🏠 *Menu Admin*", adminMenu());
                } catch (error) {
                    console.error("Add product error:", error);
                    await ctx.reply("❌ Failed to save product. Please try again later.");
                }
                ctx.session.step = null;
                ctx.session.newProduct = null;
                break;
            }

            // === Trạng thái mặc định (không có step nào đang chờ) ===
            default: {
                await ctx.reply("🤖 Bạn vừa gửi tin nhắn văn bản, nhưng hiện bot không chờ nhập liệu nào.");
                break;
            }
        }
    });
}
