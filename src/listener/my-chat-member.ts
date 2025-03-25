import { config } from "../config";
import type { Context } from "grammy";

export const MyChatMemberListener = async (ctx: Context) => {
    if (ctx.myChatMember) {
        console.log(`[Debug] 聊天ID: ${ctx.myChatMember.chat.id}, 类型: ${ctx.myChatMember.chat.type}`);
        console.log(`[Debug] 机器人状态: 旧=${ctx.myChatMember.old_chat_member.status}, 新=${ctx.myChatMember.new_chat_member.status}`);

        if (config.CHANNEL_ID) {
            console.log(`[Debug] 配置的频道ID: ${config.CHANNEL_ID}`);

            if (ctx.myChatMember.chat.id.toString() === config.CHANNEL_ID) {
                console.log(`[Debug] 检测到机器人在目标频道的状态变化`);
                const status = ctx.myChatMember.new_chat_member.status;
                if (status === 'administrator') {
                    console.log("[Debug] 机器人已被设置为频道管理员，可以正常工作");
                } else if (status === 'left' || status === 'kicked') {
                    console.log("[Debug] 警告：机器人已从频道中被移除，部分功能将无法使用");
                } else {
                    console.log(`[Debug] 机器人状态变更为: ${status}`);
                }
                return;
            }
            
            console.log(`[Debug] 状态变化不是针对目标频道`);
            return;
        }

        console.log(`[Debug] 未配置频道ID`);
        return;
    }
}