import { Telegraf, session } from "telegraf"; // session từ telegraf
import { TELEGRAM_TOKEN } from "./utils/env.js";
// import startCommand from "./bot/commands/start.js";
// import helpCommand from "./bot/commands/help.js";
// import productsCommand from "./bot/actions/products.js";
// import adminCommand from "./bot/commands/admin.js";
// import ListUserAction from "./bot/actions/admin/ListUser.js";
// import UserAction from "./bot/actions/admin/UserAction.js";
import { fileURLToPath } from "url";
import { pathToFileURL } from "url";
import path from "path";
import fs from "fs";
import { setBot } from "./bot/botInstance.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (!TELEGRAM_TOKEN) {
    console.error("❌ BOT_TOKEN chưa được cấu hình trong .env");
    process.exit(1);
}

const bot = new Telegraf(TELEGRAM_TOKEN);
bot.use(session());
setBot(bot);

// === Hàm load toàn bộ module ===


async function loadModulesFromDir(dirPath) {
    const files = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const file of files) {
        const fullPath = path.join(dirPath, file.name);

        if (file.isDirectory()) {
            await loadModulesFromDir(fullPath);
        } else if (file.name.endsWith(".js")) {
            const moduleUrl = pathToFileURL(fullPath).href; // ✅ convert sang file://
            const module = await import(moduleUrl);
            if (typeof module.default === "function") {
                module.default(bot);
                console.log(`✅ Loaded module: ${file.name}`);
            }
        }
    }
}


// === Load tất cả command & action ===
const commandsPath = path.join(__dirname, "bot/commands");
const actionsPath = path.join(__dirname, "bot/actions");

await loadModulesFromDir(commandsPath);
await loadModulesFromDir(actionsPath);

console.log("🚀 All bot modules loaded successfully!");


// Lắng nghe mọi lỗi
bot.catch((err) => console.error("⚠️ Lỗi bot:", err));

// Khởi động bot
bot.launch();
console.log("🤖 Bot đang chạy...");

// Dừng bot an toàn khi tắt process
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
