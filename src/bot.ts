import { Bot } from "grammy";
import { config } from "./config";
import { StatusCommand } from "./command/status";
import { RankCommand } from "./command/rank";
import { StartCommand } from "./command/start";
import { LinkCommand } from "./command/link";
import { ChatMemberListener } from "./listener/chat-member";
import { MyChatMemberListener } from "./listener/my-chat-member";
import { storage } from ".";

export async function setupBot() {
    const bot = new Bot(config.BOT_TOKEN);

    bot.use(async (ctx, next) => {
        if (!ctx.from) return await next();

        const userId = ctx.from.id;
        let user = await storage.getUser(userId);

        if (!user) {
            user = {
                id: userId,
                username: ctx.from.username,
                firstName: ctx.from.first_name,
                lastName: ctx.from.last_name,
                inviteCount: 0
            };
            await storage.saveUser(user);
        }

        return await next();
    });


    bot.on("chat_member", ChatMemberListener);
    bot.on("my_chat_member", MyChatMemberListener);

    // Command to generate and show user's personal invite link
    bot.command("mylink", LinkCommand);
    bot.command("status", StatusCommand);
    bot.command("rank", RankCommand);
    bot.command("start", StartCommand);

    return bot;
} 