import { expect, test, describe } from "bun:test";
import { generateInviteLink, createInviteUrl } from "../src/utils/linkGenerator";

describe("链接生成器测试", () => {
    test("应该生成正确格式的 Telegram URL", () => {
        const botUsername = "testbot";
        const linkId = generateInviteLink();

        const url = createInviteUrl(botUsername, linkId);

        expect(url).toBe(`https://t.me/${botUsername}?start=${linkId}`);
    });
}); 