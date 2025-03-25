import { InlineKeyboard, type Context } from "grammy";
import { bot } from "..";
import { pendingJoins, storage } from "../bot";
import type { CommandContext } from "grammy";
import { config } from "../config";

export const StartCommand = async (ctx: Context) => {
    if (!ctx.from) return;

    const startParam = ctx.match as string;
    if (startParam) {
        const inviteeId = ctx.from.id;
        const inviterId = await storage.getUserByInviteLink(startParam);

        if (inviterId && inviteeId !== inviterId) {
            const existingInvite = await storage.getInviteDataForUser(inviteeId);

            try {
                const channelId = config.CHANNEL_ID;
                if (channelId) {
                    const chatInviteLink = await bot.api.createChatInviteLink(channelId, {
                        name: `Invite for user ${inviteeId}`,
                        creates_join_request: false,
                        expire_date: Math.floor(Date.now() / 1000) + 3600
                    });

                    if (!existingInvite) {
                        pendingJoins.set(inviteeId, inviterId);
                    }

                    await ctx.reply(
                        `Welcome! You have been invited to join our channel.\nPlease click the button below to join:`,
                        {
                            reply_markup: new InlineKeyboard().url("Join Channel", chatInviteLink.invite_link)
                        }
                    );
                } else {
                    await ctx.reply(
                        `Welcome! You have gained access through an invitation link, but the channel information is not configured. Please contact the administrator.`
                    );
                }
            } catch (error) {
                console.error("Unable to create channel invite link:", error);
                await ctx.reply(
                    `Welcome! You have been invited, but the invitation link cannot be generated automatically. Please contact the administrator to join the channel.`
                );
            }
        } else {
            await ctx.reply(
                `You need to use an invitation link to join the channel`
            );
        }
    } else {
        await ctx.reply(
            `Welcome to the Invitation Statistics Bot!\n\n` +
            `📱 Use /mylink to get your invitation link\n` +
            `📊 Use /status to view your statistics\n` +
            `🏆 Use /rank to view the leaderboard`
        );
    }
}