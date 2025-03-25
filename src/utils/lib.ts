import type { Context } from "grammy";

export const isInChannel = (ctx: Context) => {
    return ctx.chat?.type === 'supergroup' || ctx.chat?.type === 'group';
};