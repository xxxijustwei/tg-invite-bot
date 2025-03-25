import type { Context } from "grammy";
import { isInChannel } from "../utils/lib";
import { storage } from "../bot";

export const StatusCommand = async (ctx: Context) => {
    if (!ctx.from) return;
    
    if (!isInChannel(ctx)) {
        await ctx.reply("Please use this command in the channel.");
        return;
    }

    const userId = ctx.from.id;
    const user = await storage.getUser(userId);

    if (!user) return;

    const rank = await storage.getUserRank(userId);

    await ctx.reply(
        `📊 <b>Your Invitation Statistics</b>\n\n` +
        `👤 Name: ${user.first_name} ${user.last_name || ""}\n` +
        `🔗 Invited: <b>${user.invite_count}</b> friends\n` +
        `🏆 Rank: <b>#${rank}</b>\n\n` +
        `Use /mylink to get your invitation link\n` +
        `Use /rank to view the leaderboard`,
        {
            parse_mode: "HTML",
        }
    );
}