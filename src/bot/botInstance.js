let botInstance = null;

export const setBot = (bot) => {
    botInstance = bot;
};

export const getBot = () => {
    if (!botInstance) throw new Error("Bot instance not initialized");
    return botInstance;
};
