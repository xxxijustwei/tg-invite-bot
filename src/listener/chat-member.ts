import type { Context } from "grammy";
import { config } from "../config";
import { bot, pendingJoins, storage } from "..";

export const ChatMemberListener = async (ctx: Context) => {
    if (!ctx.chatMember || !config.CHANNEL_ID) {
        return;
    }

    if (ctx.chatMember.chat.id.toString() !== config.CHANNEL_ID) {
        return;
    }

    const oldStatus = ctx.chatMember.old_chat_member.status;
    const newStatus = ctx.chatMember.new_chat_member.status;

    const userId = ctx.chatMember.new_chat_member.user.id;

    if ((oldStatus === 'left' || oldStatus === 'kicked' || oldStatus === 'restricted') &&
        (newStatus === 'member' || newStatus === 'administrator' || newStatus === 'creator')) {

        if (pendingJoins.has(userId)) {
            const inviterId = pendingJoins.get(userId)!;

            const existingInvite = await storage.getInviteDataForUser(userId);

            if (!existingInvite) {
                await storage.trackInvite(inviterId, userId);

                const inviter = await storage.getUser(inviterId);
                if (inviter) {
                    try {
                        await bot.api.sendMessage(
                            inviterId,
                            `${ctx.chatMember.new_chat_member.user.first_name} 已成功通过您的邀请链接加入频道！您目前已邀请了 ${inviter.inviteCount} 位好友。`
                        );
                    } catch (error) {
                        console.log(`[DEBUG] 无法通知邀请人 ${inviterId}:`, error);
                    }
                }
            }

            pendingJoins.delete(userId);
        }
    }
}