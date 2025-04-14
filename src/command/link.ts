import { GrammyError, type Context } from "grammy";
import { isInChannel } from "../utils/lib";
import { bot } from "..";
import { storage } from "../bot";
import { createInviteUrl, generateInviteLink } from "../utils/linkGenerator";

export const LinkCommand = async (ctx: Context) => {
    if (!ctx.from) return;

    const botInfo = await bot.api.getMe();
    try {
        if (!isInChannel(ctx)) {
            const userId = ctx.from.id;
            let user = await storage.getUser(userId);

            if (!user) {
                return;
            }

            if (!user.invite_link) {
                const linkId = generateInviteLink();
                user.invite_link = linkId;
                await storage.saveUser(user);
                await storage.saveInviteLink(userId, linkId);
            }

            const inviteUrl = createInviteUrl(botInfo.username, user.invite_link);

            await ctx.reply(
                `🔗 <b>This is your exclusive invitation link</b>\n\n${inviteUrl}\n\nInvite friends to join our channel!`,
                {
                    parse_mode: "HTML"
                }
            );
        } else {
            await ctx.reply(
                "Click the button below to get your invitation link:",
                {
                    reply_parameters: ctx.message?.message_id ? { message_id: ctx.message.message_id } : undefined,
                    reply_markup: {
                        inline_keyboard: [[
                            { text: "🔗 Get Invite Link", url: `https://t.me/${botInfo.username}?start=getlink` }
                        ]]
                    }
                }
            );
        }
    } catch (error) {
        if (error instanceof GrammyError) {
            console.error("Error sending message:", error.description);
        } else {
            console.error("Unknown error:", error);
        }
    }
}