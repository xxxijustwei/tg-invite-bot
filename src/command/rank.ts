import type { Context } from "grammy";
import { isInChannel } from "../utils/lib";
import { storage } from "../bot";
import type { RankEntry } from "../types";

export const RankCommand = async (ctx: Context) => {
    if (!isInChannel(ctx)) {
        await ctx.reply("Please use this command in the channel.");
        return;
    }

    const topUsers = await storage.getTopInviters(10);

    if (topUsers.length === 0) {
        await ctx.reply("There are no rankings yet. Be the first to invite friends!");
        return;
    }

    const rankEntries: RankEntry[] = topUsers.map((user, index) => ({
        userId: user.id,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        invite_count: user.invite_count,
        rank: index + 1
    }));

    let message = "🏆 <b>Invitation Leaderboard</b> 🏆\n\n";

    rankEntries.forEach(entry => {
        const medal = entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : entry.rank === 3 ? "🥉" : `${entry.rank}.`;
        const name = `${entry.first_name} ${entry.last_name || ""}`.trim();
        const username = entry.username ? ` (@${entry.username})` : "";

        message += `${medal} ${name}${username}: <b>${entry.invite_count}</b> friends\n`;
    });

    message += "\nUse /mylink to get your invitation link";

    await ctx.reply(message, { parse_mode: "HTML" });
}