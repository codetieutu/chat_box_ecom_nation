import { getUserById, updateUser, addAdmin } from "../../utils/userUtil.js";
import { ADMIN_PASSWORD } from "../../utils/env.js";
import { adminMenu } from "../commands/admin.js";
import { Markup } from "telegraf";
import { showMenu } from "../commands/start.js";
import { notifyAdmin } from "../sendMess.js";
import { getTransactionByHash } from "../../utils/payment2.js";
import { addTransaction } from "../../utils/depositUtil.js";


const inputContent = async (ctx) => {
    const content = ctx.message.text.trim()
    const quantity = ctx.session.quantity;
    const product = ctx.session.product;
    const user = await getUserById(ctx.from.id);
    const order = {
        userId: ctx.from.id,
        productId: product.id,
        productName: product.name,
        quantity: quantity,
        note: content,
        totalPrice: parseFloat(quantity) * parseFloat(product.price)
    }
    try {
        await notifyAdmin(`new order ${product.name}:${quantity}`)
        const userNew = await updateUser(ctx.from.id, { balance: parseFloat(user.balance) - quantity * parseFloat(product.price), transaction: parseInt(user.transaction) + quantity });
        await ctx.reply("Your order is being processed. Please wait.");
        ctx.session.selectedProduct = null;
        ctx.session.step = null
        ctx.session.quantity = null;
        showMenu(ctx, userNew);
    } catch (error) {
        console.error(error);
        ctx.reply("❌ Error while placing order. Please try again. ")
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


const inputTxId = async (ctx) => {
    const txid = ctx.message.text.trim();
    const time = ctx.session.time;
    const transaction = await getTransactionByHash(txid, time);
    if (!transaction.status) {
        ctx.reply("Transaction not found, Please re-enter.");
        return;
    }
    transaction.tx_hash = txid;
    const amount = parseFloat(transaction.amount);
    const user = await getUserById(ctx.from.id);
    if (!user) {
        ctx.reply("error");
    }

    const newUser = await updateUser(user.id, { balance: parseFloat(user.balance) + parseFloat(amount) });

    await ctx.reply(
        `✅ *Deposit Successful!*\n\n💰 *Amount:* ${amount}$\n💼 *New Balance:* ${newUser.balance}$`,
        {
            parse_mode: "Markdown",
            ...Markup.inlineKeyboard([
                [Markup.button.callback("↩️ Back to Home", "SHOW_HOME_MEDIA")],
            ]),
        }
    );
    const message = `📢 *New Deposit Received!*\n\n👤 User: @${user.username}\n💰 Amount: ${amount} $`;

    await notifyAdmin(message);
    try {
        await addTransaction(transaction);
    } catch (error) {
        console.error(">>check err", error);
    }

    ctx.session.time = null
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

            case "waiting_txid": {
                inputTxId(ctx);
                break;
            }

            case "waiting_complete_message": {
                inputCompletedMess(ctx);
                break;
            }

            case "wait_attach_content": {
                inputContent(ctx);
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
