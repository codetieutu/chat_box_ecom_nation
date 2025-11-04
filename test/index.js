import { Telegraf, session } from "telegraf"; // session từ telegraf
import { TELEGRAM_TOKEN } from "./utils/env.js";
import startCommand from "./bot/commands/start.js";
import helpCommand from "./bot/commands/help.js";
import productsCommand from "./bot/actions/products.js";
import buyAction from "./actions/buy.js";

if (!TELEGRAM_TOKEN) {
    console.error("❌ BOT_TOKEN chưa được cấu hình trong .env");
    process.exit(1);
}

const bot = new Telegraf(TELEGRAM_TOKEN);
bot.use(session());

// Gắn lệnh /start
startCommand(bot);
productsCommand(bot);
helpCommand(bot);
buyAction(bot);


// Lắng nghe mọi lỗi
bot.catch((err) => console.error("⚠️ Lỗi bot:", err));

// Khởi động bot
bot.launch();
console.log("🤖 Bot đang chạy...");

// Dừng bot an toàn khi tắt process
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
