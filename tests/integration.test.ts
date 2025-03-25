import { expect, test, describe, beforeEach } from "bun:test";
import { MockStorageService } from "../src/storage/mockStorage.ts";
import { generateInviteLink, createInviteUrl } from "../src/utils/linkGenerator";
import type { StorageService } from "../src/storage/index.ts";
import type { User } from "../src/types";

describe("邀请流程集成测试", () => {
    let storage: StorageService;

    // 测试数据
    const alice: User = { id: 101, first_name: "Alice", invite_count: 0 };
    const bob: User = { id: 102, first_name: "Bob", invite_count: 0 };
    const charlie: User = { id: 103, first_name: "Charlie", invite_count: 0 };

    // 每个测试前初始化数据
    beforeEach(async () => {
        storage = new MockStorageService();
        await (storage as MockStorageService).clearAll();

        // 初始化测试用户
        await storage.saveUser(alice);
        await storage.saveUser(bob);
        await storage.saveUser(charlie);
    });

    test("完整邀请流程", async () => {
        // 1. Alice 生成一个邀请链接
        const aliceLinkId = generateInviteLink();

        // 测试 createInviteUrl 函数 - 提高覆盖率
        const botUsername = "testInviteBot";
        const fullInviteUrl = createInviteUrl(botUsername, aliceLinkId);
        expect(fullInviteUrl).toBe(`https://t.me/${botUsername}?start=${aliceLinkId}`);

        // 保存链接与 Alice 的关联
        await storage.saveInviteLink(alice.id, aliceLinkId);

        // 2. Bob 生成一个邀请链接
        const bobLinkId = generateInviteLink();

        // 确认不同用户生成的链接是不同的
        expect(bobLinkId).not.toBe(aliceLinkId);

        // 保存链接与 Bob 的关联
        await storage.saveInviteLink(bob.id, bobLinkId);

        // 3. 用户 Dave 通过 Alice 的链接加入
        const daveId = 201;
        const dave: User = { id: daveId, first_name: "Dave", invite_count: 0 };
        await storage.saveUser(dave);

        // 获取链接所有者并记录邀请
        const aliceLink = await storage.getUserByInviteLink(aliceLinkId);
        expect(aliceLink).toBe(alice.id);

        await storage.trackInvite(alice.id, dave.id);

        // 4. 用户 Eve 通过 Alice 的链接加入
        const eveId = 202;
        const eve: User = { id: eveId, first_name: "Eve", invite_count: 0 };
        await storage.saveUser(eve);

        await storage.trackInvite(alice.id, eve.id);

        // 5. 用户 Frank 通过 Bob 的链接加入
        const frankId = 203;
        const frank: User = { id: frankId, first_name: "Frank", invite_count: 0 };
        await storage.saveUser(frank);

        const bobLink = await storage.getUserByInviteLink(bobLinkId);
        expect(bobLink).toBe(bob.id);

        await storage.trackInvite(bob.id, frank.id);

        // 验证计数和排名
        const updatedAlice = await storage.getUser(alice.id);
        expect(updatedAlice?.invite_count).toBe(2);

        const updatedBob = await storage.getUser(bob.id);
        expect(updatedBob?.invite_count).toBe(1);

        const updatedCharlie = await storage.getUser(charlie.id);
        expect(updatedCharlie?.invite_count).toBe(0);

        // 6. 获取排行榜
        const topUsers = await storage.getTopInviters();

        // Alice 应该排在第一位
        expect(topUsers.length).toBeGreaterThan(0);
        expect(topUsers[0]!.id).toBe(alice.id);
        expect(topUsers[0]!.invite_count).toBe(2);

        // Bob 应该排在第二位
        expect(topUsers.length).toBeGreaterThan(1);
        expect(topUsers[1]!.id).toBe(bob.id);
        expect(topUsers[1]!.invite_count).toBe(1);

        // 测试指定限制数量的排行榜
        const top1Users = await storage.getTopInviters(1);
        expect(top1Users.length).toBe(1);
        expect(top1Users[0]!.id).toBe(alice.id);

        // 验证用户排名
        expect(await storage.getUserRank(alice.id)).toBe(1);
        expect(await storage.getUserRank(bob.id)).toBe(2);
        expect(await storage.getUserRank(charlie.id)).toBe(3);

        // 测试不存在用户的排名
        expect(await storage.getUserRank(999)).toBe(0);

        // 验证被邀请用户数据
        const daveInvite = await storage.getInviteDataForUser(dave.id);
        expect(daveInvite).not.toBeNull();
        expect(daveInvite?.inviterId).toBe(alice.id);

        const eveInvite = await storage.getInviteDataForUser(eve.id);
        expect(eveInvite).not.toBeNull();
        expect(eveInvite?.inviterId).toBe(alice.id);

        const frankInvite = await storage.getInviteDataForUser(frank.id);
        expect(frankInvite).not.toBeNull();
        expect(frankInvite?.inviterId).toBe(bob.id);
    });

    // 添加独立的链接生成器测试以提高覆盖率
    test("链接生成器功能", () => {
        // 测试生成邀请链接
        const linkId = generateInviteLink();
        expect(linkId).toBeDefined();
        expect(linkId.length).toBe(8);

        // 再次生成，确保链接是唯一的
        const linkId2 = generateInviteLink();
        expect(linkId2).not.toBe(linkId);

        // 测试 createInviteUrl 函数
        const botUsername = "myTestBot";
        const inviteUrl = createInviteUrl(botUsername, linkId);
        expect(inviteUrl).toBe(`https://t.me/${botUsername}?start=${linkId}`);

        // 测试不同用户名的 URL 生成
        const anotherBotUsername = "anotherBot";
        const anotherInviteUrl = createInviteUrl(anotherBotUsername, linkId);
        expect(anotherInviteUrl).toBe(`https://t.me/${anotherBotUsername}?start=${linkId}`);
    });

    // 添加测试以覆盖更多边缘情况
    test("存储服务边缘情况", async () => {
        // 测试不存在的用户
        const nonExistentUser = await storage.getUser(9999);
        expect(nonExistentUser).toBeNull();

        // 测试不存在的邀请链接
        const nonExistentLinkOwner = await storage.getUserByInviteLink("non-existent-link");
        expect(nonExistentLinkOwner).toBeNull();

        // 测试不存在的邀请数据
        const nonExistentInviteData = await storage.getInviteDataForUser(9999);
        expect(nonExistentInviteData).toBeNull();

        // 测试邀请不存在的用户(inviter存在但invitee不在数据库中)
        await storage.trackInvite(alice.id, 9999);
        const updatedAlice = await storage.getUser(alice.id);
        expect(updatedAlice!.invite_count).toBe(3); // 应该从2增加到3

        const inviteData = await storage.getInviteDataForUser(9999);
        expect(inviteData).not.toBeNull();
        expect(inviteData!.inviterId).toBe(alice.id);
        expect(inviteData!.inviteeId).toBe(9999);
    });
}); 