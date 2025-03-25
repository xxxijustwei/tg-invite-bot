import { GrammyError, type Context } from "grammy";
import { isInChannel } from "../utils/lib";
import { bot } from "..";
import { storage } from "../bot";
import { createInviteUrl, generateInviteLink } from "../utils/linkGenerator";

export const LinkCommand = async (ctx: Context) => {
    if (!ctx.from) return;

    // Check if user is in the channel
    if (!isInChannel(ctx)) {
        await ctx.reply("Please use this command in the channel.");
        return;
    }

    const userId = ctx.from.id;
    let user = await storage.getUser(userId);

    if (!user) {
        return; // Should never happen due to middleware
    }

    // Generate invite link if it doesn't exist
    if (!user.invite_link) {
        const linkId = generateInviteLink();
        user.invite_link = linkId;
        await storage.saveUser(user);
        await storage.saveInviteLink(userId, linkId);
    }

    const botInfo = await bot.api.getMe();
    const inviteUrl = createInviteUrl(botInfo.username, user.invite_link);

    // Send message visible only to the requesting user
    try {
        // Send to user via telegram private message
        await bot.api.sendMessage(
            userId,
            `🔗 <b>This is your exclusive invitation link</b>\n\n${inviteUrl}\n\nInvite friends to join our channel!`,
            {
                parse_mode: "HTML"
            }
        );
        
        // If the command was sent in the channel, notify the user to check private messages
        if (ctx.chat?.type !== "private") {
            await ctx.reply("✅ Please check your private messages for your invitation link", {
                reply_parameters: ctx.message?.message_id ? { message_id: ctx.message.message_id } : undefined,
            });
        }
    } catch (error) {
        if (error instanceof GrammyError) {
            console.error("Error sending message:", error.description);
        } else {
            console.error("Unknown error:", error);
        }
    }
}