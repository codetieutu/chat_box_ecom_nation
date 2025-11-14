import { getProductByQuantity } from "../../utils/stockUtil.js";
import { getUserById, updateUser } from "../../utils/userUtil.js";
import { showMenu } from "../commands/start.js";
import { exportProductsToTxt } from "../export.js";

export default (bot) => {
    bot.action(/PAYMENT_(\d+)/, async (ctx) => {
        await ctx.answerCbQuery();
        const userId = ctx.from.id;
        const user = await getUserById(userId);
        const productId = Number(ctx.match[1]);
        const product = ctx.session.product;
        const totalPayment = parseFloat(product.currenQuan) * parseFloat(product.price);
        if (parseFloat(user.balance) < totalPayment) {
            ctx.reply("insufficient balance, please deposit");
            return;
        }
        if (product.type === "preorder") {
            ctx.session.step = "wait_attach_content";
            ctx.session.quantity = product.currenQuan;
            await ctx.reply("💰 Enter the attached content:", {
                parse_mode: "Markdown",
            });
            return;
        }
        const products = await getProductByQuantity(product.id, product.currenQuan);
        await exportProductsToTxt(ctx, products);
        const userNew = await updateUser(userId, { balance: parseFloat(user.balance) - totalPayment, transaction: parseInt(user.transaction) + product.currenQuan });
        ctx.session.selectedProduct = null;
        ctx.session.step = null
        showMenu(ctx, userNew);
    })
}