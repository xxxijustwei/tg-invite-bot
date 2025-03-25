import { customAlphabet } from 'nanoid';

export function generateInviteLink(): string {
    const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    const nanoid = customAlphabet(alphabet, 8);

    return nanoid();
}

/**
 * 创建完整的 Telegram 邀请 URL
 * @param botUsername 机器人的用户名
 * @param linkId 唯一的链接标识符
 * @returns 可以分享的完整邀请 URL
 */
export function createInviteUrl(botUsername: string, linkId: string): string {
    return `https://t.me/${botUsername}?start=${linkId}`;
} 