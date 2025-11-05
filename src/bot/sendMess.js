import { getIdAdmin } from "../utils/userUtil.js";
import { getBot } from "./botInstance.js";


const notifyAdmin = async (message) => {
    const bot = getBot();
    const ids = await getIdAdmin();
    for (const id of ids) {
        try {
            await bot.telegram.sendMessage(id.id, `📢 ${message}`, {
                parse_mode: "Markdown",
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

export {
    notifyAdmin,
    notifyUser,
}
