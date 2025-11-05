import { getUserById } from "../../utils/userUtil.js";
import { showMenu } from "./start.js";

export default (bot) => {
    bot.command("menu", async (ctx) => {
        const userId = ctx.from.id;
        try {
            const user = await getUserById(userId);
            showMenu(ctx, user);
        } catch (error) {

        }
    })
}