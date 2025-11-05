import { Markup } from "telegraf";
import { completeOrder, getOrderById } from "../../../utils/orderUtil.js";
import { getUserById, updateUser } from "../../../utils/userUtil.js";
import { notifyUser } from "../../sendMess.js";

export default (bot) => {
    // 🧾 Hiển thị chi tiết đơn hàng
    bot.action(/^ORDER_(\d+)/, async (ctx) => {
        try {
            await ctx.answerCbQuery();
            const orderId = ctx.match[1];

            const order = await getOrderById(orderId);
            if (!order) {
                await ctx.reply("❌ Order not found.");
                return;
            }

            const buyer = await getUserById(order.user_id);

            const text = `
📦 *Order Details*
────────────────────
🆔 *Order ID:* ${order.id}
📅 *Created:* ${new Date(order.created_at).toLocaleString("vi-VN")}

🛍️ *Product:* ${order.product_name}
🔢 *Quantity:* ${order.quantity}
💰 *Total:* ${order.total_price.toLocaleString()}$

👤 *Buyer:* @${buyer?.username || "unknown"}
🧾 *Note:* ${order.note || "_(no additional note)_"}

`;

            // 🔘 Nút hành động động
            const actionButtons = [];

            if (!order.is_completed && order.status !== "cancelled") {
                actionButtons.push([
                    Markup.button.callback("✅ Complete", `COMPLETE_ORDER_${order.id}`),
                    Markup.button.callback("❌ Cancel", `CANCEL_ORDER_${order.id}`)
                ]);
            }

            actionButtons.push([
                Markup.button.callback("↩️ Back to Orders", "ADMIN_ORDERS_0"),
            ]);

            if (ctx.callbackQuery?.message) {
                await ctx.editMessageText(text, {
                    parse_mode: "Markdown",
                    reply_markup: { inline_keyboard: actionButtons },
                });
            } else {
                await ctx.reply(text, {
                    parse_mode: "Markdown",
                    reply_markup: { inline_keyboard: actionButtons },
                });
            }
        } catch (error) {
            console.error("⚠️ showOrderDetail error:", error);
            await ctx.reply("❌ Failed to load order details.");
        }
    });

    // ✅ Đánh dấu hoàn thành
    bot.action(/^COMPLETE_ORDER_(\d+)/, async (ctx) => {
        try {
            await ctx.answerCbQuery();
            const orderId = ctx.match[1];

            // Lưu session
            ctx.session = ctx.session || {};
            ctx.session.step = "waiting_complete_message";
            ctx.session.OrderId = orderId;

            await ctx.reply(
                `💬 Please enter the message or delivery content (e.g., activation code, account info, note, etc.):`,
                { parse_mode: "Markdown" }
            );
        } catch (err) {
            console.error("❌ completeOrder setup error:", err);
        }
    });

    // ❌ Hủy đơn hàng
    bot.action(/CANCEL_ORDER_(\d+)/, async (ctx) => {
        try {
            await ctx.answerCbQuery();
            const orderId = ctx.match[1];
            const order = await getOrderById(orderId);
            const user = await getUserById(order.user_id);
            await completeOrder(orderId);
            await updateUser(order.user_id, { balance: parseFloat(user.balance) + parseFloat(order.total_price), transaction: parseInt(user.transaction) - parseInt(order.quantity) });
            const message = `
❌ *Your Order Has Been Cancelled!*
────────────────────
💬 *Message from Seller:*
Dear customer, your ${order.product_name} order was canceled by the seller.
A total of ${order.total_price}$ has been successfully refunded to your account balance.
`;
            await notifyUser(user.id, message)
            await ctx.editMessageText(`❌ Order #${orderId} has been *Cancelled*.`, {
                parse_mode: "Markdown",
                reply_markup: {
                    inline_keyboard: [
                        [Markup.button.callback("↩️ Back", "ADMIN_ORDERS_0")]
                    ]
                }
            });
        } catch (err) {
            console.error("❌ cancelOrder error:", err);
        }
    });
};
