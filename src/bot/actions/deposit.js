import { Markup } from "telegraf";
import path from "path";
import { fileURLToPath } from "url";
import { ADDRESS_WALLET, NETWORK } from "../../utils/env.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default (bot) => {
    bot.action("DEPOSIT", async (ctx) => {
        try {
            await ctx.answerCbQuery();

            // Example: your Polygon wallet address
            const walletAddress = "kdjbfgdkj";

            // Optional QR image (store it in your assets folder)
            const qrPath = path.join(process.cwd(), "assets/deposit_qr.jpg");

            const caption = `
💰 *Crypto Deposit — Polygon Network*

📢 *Important Notice:*
Please **DO NOT send funds** before clicking the *✅ Request deposit* button below.

🏦 *Deposit Address (${NETWORK}):*
\`${ADDRESS_WALLET}\`

You can scan the QR code above to send funds.

Once you’ve made the transfer, please enter your *Transaction ID (TxID)* below so we can verify your deposit.
`;

            // Send QR + caption
            await ctx.editMessageMedia(
                {
                    type: "photo",
                    media: { source: qrPath }, // ← bắt buộc
                    caption: caption,
                    parse_mode: "Markdown"
                },
                {
                    reply_markup: {
                        inline_keyboard: [
                            [Markup.button.callback("✅ Request deposit", "DEPOSIT_ENTER_TXID")],
                            [Markup.button.callback("↩️ Back", "SHOW_HOME_MEDIA")]
                        ]
                    }
                }
            );

        } catch (err) {
            console.error("⚠️ Deposit UI error:", err);
            await ctx.reply("⚠️ Failed to load deposit instructions. Please try again later.");
        }
    });

    bot.action("DEPOSIT_ENTER_TXID", async (ctx) => {
        await ctx.answerCbQuery();
        ctx.session = ctx.session || {};
        ctx.session.time = Date.now();
        ctx.session.step = "waiting_txid";

        await ctx.reply("🔍 Please enter your *Transaction ID (TxID) ~ 12 numbers*:", {
            parse_mode: "Markdown",
        });
    });

    // // Step 3: Handle user message (TxID input)
    // bot.on("text", async (ctx) => {
    //     ctx.session = ctx.session || {};
    //     if (ctx.session.step === "waiting_txid") {
    //         const txid = ctx.message.text.trim();

    //         if (txid.length < 10) {
    //             await ctx.reply("❌ Invalid Transaction ID. Please check and enter again.");
    //             return;
    //         }

    //         // Simulate saving or verifying the transaction
    //         // TODO: Add your database logic here
    //         console.log(`💳 Received TxID from ${ctx.from.username}: ${txid}`);

    //         await ctx.reply(
    //             "✅ Thank you! Your transaction has been received.\nOur team will verify it shortly.",
    //             {
    //                 parse_mode: "Markdown",
    //                 ...Markup.inlineKeyboard([
    //                     [Markup.button.callback("↩️ Back to Home", "SHOW_HOME")],
    //                 ]),
    //             }
    //         );

    //         ctx.session.step = null;
    //     }
    // });
};
