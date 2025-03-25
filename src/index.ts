import { Hono } from "hono";
import type { Context } from "hono";
import { setupBot, storage, pendingJoins } from "./bot";

const app = new Hono();
export let bot: Awaited<ReturnType<typeof setupBot>>;

// Health check endpoint
app.get("/", (c: Context) => {
    return c.text("Telegram Bot is running", 200);
});

// Start polling for development
async function startPolling() {
    console.log("Starting bot in polling mode...");

    // 设置更详细的日志级别（仅开发环境）
    process.env.DEBUG = process.env.DEBUG || "grammy*";

    bot = await setupBot();

    if (!bot) {
        throw new Error("Failed to initialize bot");
    }

    // 输出有关机器人的信息
    const botInfo = await bot.api.getMe();
    console.log(`Bot info: ${JSON.stringify(botInfo)}`);

    // Start polling with explicit allowed updates
    await bot.start({
        allowed_updates: ["message", "callback_query", "chat_member", "my_chat_member"],
        drop_pending_updates: false,
        onStart: (botInfo) => {
            console.log(`Bot @${botInfo.username} started in polling mode!`);
            console.log("Commands:");
            console.log("- /mylink - Get your invite link");
            console.log("- /status - View your stats");
            console.log("- /rank - View the leaderboard");
        }
    });
}

startPolling().catch(console.error);

export default app;