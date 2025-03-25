import { expect, test, describe, beforeEach } from "bun:test";
import { MockStorageService } from "../src/storage/mockStorage.ts";
import type { StorageService } from "../src/storage/index.ts";
import type { User } from "../src/types";

describe("存储服务测试", () => {
    let storage: StorageService;

    // 测试用户数据
    const testUsers: User[] = [
        { id: 101, firstName: "Alice", inviteCount: 5 },
        { id: 102, firstName: "Bob", inviteCount: 3 },
        { id: 103, firstName: "Charlie", inviteCount: 8 },
    ];

    // 每个测试前，创建一个新的存储实例并清空数据
    beforeEach(async () => {
        storage = new MockStorageService();
        await (storage as MockStorageService).clearAll();

        // 初始化测试用户
        for (const user of testUsers) {
            await storage.saveUser(user);
        }
    });

    test("应该正确保存和获取用户", async () => {
        const user = await storage.getUser(101);
        expect(user).toBeDefined();
        expect(user?.id).toBe(101);
        expect(user?.firstName).toBe("Alice");
        expect(user?.inviteCount).toBe(5);
    });

    test("对于不存在的用户应返回 null", async () => {
        const user = await storage.getUser(999);
        expect(user).toBeNull();
    });

    test("应该正确保存和检索邀请链接", async () => {
        const userId = 101;
        const linkId = "test-link-123";

        await storage.saveInviteLink(userId, linkId);
        const retrievedId = await storage.getUserByInviteLink(linkId);

        expect(retrievedId).toBe(userId);
    });

    test("应该正确跟踪邀请", async () => {
        const inviterId = 101; // Alice
        const inviteeId = 201;

        // 记录邀请前获取邀请者初始计数
        const aliceBefore = await storage.getUser(inviterId);
        const initialCount = aliceBefore?.inviteCount || 0;

        // 记录邀请
        await storage.trackInvite(inviterId, inviteeId);

        // 检查邀请者计数增加
        const aliceAfter = await storage.getUser(inviterId);
        expect(aliceAfter?.inviteCount).toBe(initialCount + 1);

        // 检查邀请记录存在
        const invite = await storage.getInviteDataForUser(inviteeId);
        expect(invite).toBeDefined();
        expect(invite?.inviterId).toBe(inviterId);
        expect(invite?.inviteeId).toBe(inviteeId);
    });

    test("应该正确获取排名前 N 的邀请者", async () => {
        const topUsers = await storage.getTopInviters(2);

        expect(topUsers.length).toBe(2);

        // Charlie 应该是第一名 (8个邀请)
        expect(topUsers.length).toBeGreaterThan(0);
        expect(topUsers[0]!.id).toBe(103);

        // Alice 应该是第二名 (5+1=6个邀请，算上之前的测试)
        expect(topUsers.length).toBeGreaterThan(1);
        expect(topUsers[1]!.id).toBe(101);
    });

    test("应该正确计算用户排名", async () => {
        // Charlie 应该排名第一
        expect(await storage.getUserRank(103)).toBe(1);

        // Alice 应该排名第二
        expect(await storage.getUserRank(101)).toBe(2);

        // Bob 应该排名第三
        expect(await storage.getUserRank(102)).toBe(3);

        // 不存在的用户应该返回0
        expect(await storage.getUserRank(999)).toBe(0);
    });

    test("当邀请者不存在时应正确处理", async () => {
        // 使用不存在的邀请者ID (9999)
        const nonExistentInviterId = 9999;
        const newInviteeId = 8888;

        // 检查邀请者确实不存在
        const inviterBefore = await storage.getUser(nonExistentInviterId);
        expect(inviterBefore).toBeNull();

        // 执行邀请记录（不应抛出错误）
        await storage.trackInvite(nonExistentInviterId, newInviteeId);

        // 验证邀请记录已创建
        const inviteData = await storage.getInviteDataForUser(newInviteeId);
        expect(inviteData).not.toBeNull();
        expect(inviteData?.inviterId).toBe(nonExistentInviterId);
        expect(inviteData?.inviteeId).toBe(newInviteeId);

        // 验证由于邀请者不存在，不会创建邀请者或更新邀请计数
        const inviterAfter = await storage.getUser(nonExistentInviterId);
        expect(inviterAfter).toBeNull();
    });

    test("当没有用户时排名和统计应该正确处理", async () => {
        // 创建一个新的存储实例
        const emptyStorage = new MockStorageService();

        // 清空所有存储
        await emptyStorage.clearAll();

        // 测试空数据库情况下的 getTopInviters
        const topUsers = await emptyStorage.getTopInviters();
        expect(topUsers).toEqual([]);

        // 测试有限制参数的情况
        const topUsersWithLimit = await emptyStorage.getTopInviters(5);
        expect(topUsersWithLimit).toEqual([]);

        // 测试空数据库情况下的 getUserRank
        const rank = await emptyStorage.getUserRank(101);
        expect(rank).toBe(0);
    });
}); 