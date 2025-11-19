import { getIdAdmin, getUserAll } from "../utils/userUtil.js";
import { getBot } from "./botInstance.js";


const notifyAdmin = async (message) => {
    const bot = getBot();
    const ids = await getIdAdmin();
    for (const id of ids) {
        try {
            await bot.telegram.sendMessage(id.id, message, {
                parse_mode: 'HTML',
                disable_web_page_preview: true
            });
        } catch (err) {
            console.error(`⚠️ Failed to send message to admin ${id}:`, err);
        }
    }
};
const notifyUser = async (id, message) => {

    try {
        const bot = getBot();
        await bot.telegram.sendMessage(id, `📢 ${message}`, {
            parse_mode: "Markdown",
        });
    } catch (err) {
        console.error(`⚠️ Failed to send message to admin ${id}:`, err);
    }

};
export const notifyAllUsers = async (message) => {
    try {
        const bot = getBot();
        const users = await getUserAll();

        const normalUsers = users.filter(u => !u.is_admin);


        for (const user of users) {
            try {
                await bot.telegram.sendMessage(user.id, `📢 ${message}`, {
                    parse_mode: "Markdown",
                });
            } catch (err) {
                console.error(`⚠️ Failed to send message to user ${user.id}:`, err.description || err);
            }
        }

        console.log("✔️ Broadcast completed.");
    } catch (err) {
        console.error("❌ notifyAllUsers error:", err);
    }
};

export {
    notifyAdmin,
    notifyUser,
}
