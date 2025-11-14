import { Markup } from "telegraf";
import { getProductById } from "../../utils/productUtil.js";
import { showProducts } from "./products.js";


export default (bot) => {

    bot.action(/BUY_PRODUCT_(\d+)/, async (ctx) => {
        const userId = ctx.from.id;
        await ctx.answerCbQuery();
        const productId = Number(ctx.match[1]);
        const product = await getProductById(productId);
        product.currenQuan = 1;
        ctx.session = ctx.session || {}
        ctx.session.product = product;

        // userStates.set(userId, initialState);
        await sendPremiumMessage(ctx, product);
    });

    async function sendPremiumMessage(ctx, state) {
        const totalPayment = parseFloat(state.currenQuan * state.price);

        const message = `
<b>🎯 PREMIUM APPLICATION SERVICE</b>

<b>📋 Order Confirmation:</b>
├ <b>Product:</b> ${state.name.toLocaleString()}
├ <b>Price per item:</b> ${state.price.toLocaleString()} $
├ <b>Total Payment:</b> <b>${totalPayment.toLocaleString()} $</b>
└ <b>Available stock:</b> ${state.quantity} account


    `;

        const keyboard = Markup.inlineKeyboard([
            // Hàng 1: Nút giảm
            [
                Markup.button.callback('-50', 'qty:-50'),
                Markup.button.callback('-10', 'qty:-10'),
                Markup.button.callback('-5', 'qty:-5'),
                Markup.button.callback('-1', 'qty:-1')
            ],
            // Hàng 2: Hiển thị số lượng
            [
                Markup.button.callback(`🔄 Quantity: ${state.currenQuan}`, 'display_quantity')
            ],
            // Hàng 3: Nút tăng
            [
                Markup.button.callback('+1', 'qty:1'),
                Markup.button.callback('+5', 'qty:5'),
                Markup.button.callback('+10', 'qty:10'),
                Markup.button.callback('+50', 'qty:50')
            ],
            // Hàng 4: Thanh toán
            [
                Markup.button.callback('✅ Pay with Balance', `PAYMENT_${state.id}`),
            ],
            // Hàng 5: Hành động
            [
                Markup.button.callback('↩️ Back', '/SHOW_USER_PRODUCTS_0'),
            ]
        ]);

        if (!ctx.callbackQuery) {
            await ctx.reply(message, {
                parse_mode: 'HTML',
                reply_markup: keyboard.reply_markup
            });
        } else {
            await ctx.editMessageCaption(message, {
                parse_mode: 'HTML',
                reply_markup: keyboard.reply_markup
            });
        }

    }

    bot.action(/^qty:/, async (ctx) => {
        await ctx.answerCbQuery();
        const userId = ctx.from.id;
        const action = ctx.callbackQuery.data;
        const amount = parseInt(action.split(':')[1]);
        const product = ctx.session.product;
        // Cập nhật số lượng
        let newQuantity = product.currenQuan + amount;

        // Đảm bảo số lượng không âm
        if (newQuantity < 1) {
            newQuantity = 1;
        }

        if (product.type == "available") {
            if (newQuantity > product.quantity) {
                newQuantity = product.quantity;
            }
        }

        product.currenQuan = newQuantity;
        ctx.session.product = product;

        // Cập nhật tin nhắn
        await sendPremiumMessage(ctx, product);
    });
}
