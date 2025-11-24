import { createOrder } from "../../utils/orderUtil.js";
import { getProductById } from "../../utils/productUtil.js";
import { getUserById } from "../../utils/userUtil.js";
import { payment } from "../payment.js";

export default (bot) => {
    bot.action(/PAYMENT_(\d+)/, async (ctx) => {
        await ctx.answerCbQuery();

        ctx.session ??= {};
        const variant = ctx.session.product;
        const userId = ctx.from.id;
        const product = await getProductById(variant.productId);
        const user = await getUserById(userId);
        const variantId = Number(ctx.match[1]);



        const quantity = Number(variant.currenQuan);
        const unitPrice = Number(variant.price);
        const totalPayment = quantity * unitPrice;

        // 1️⃣ Tạo QR thanh toán PayOS
        const orderCode = await payment(ctx, totalPayment);
        await createOrder({
            id: orderCode,
            user_id: String(userId),
            product_id: product.id,
            variant_id: variant.id,
            quantity: variant.currenQuan,
            unit_price: variant.price,
            total_amount: totalPayment,
            note: "",                // lưu description vào note cho dễ truy vết
            receiver_name: user.username,
            product_name: `${product.name} ${variant.name}`,
        });


        if (!orderCode) {
            return ctx.reply("❌ Không tạo được QR thanh toán.");
        }

        // 2️⃣ Lưu order pending TẠM THỜI (không lưu DB)

        await ctx.reply("🕒 Vui lòng thanh toán để tiến hành giao hàng.");
    });
};
