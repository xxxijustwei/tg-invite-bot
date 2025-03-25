import type { InviteData, User } from "../types";
import type { StorageService } from ".";

const userStore = new Map<string, User>();
const inviteStore = new Map<string, InviteData>();
const linkStore = new Map<string, number>();

export class MockStorageService implements StorageService {
    async getUser(userId: number): Promise<User | null> {
        return userStore.get(`user:${userId}`) || null;
    }

    async saveUser(user: User): Promise<void> {
        userStore.set(`user:${user.id}`, user);
    }

    async getUserByInviteLink(link: string): Promise<number | null> {
        return linkStore.get(`link:${link}`) || null;
    }

    async saveInviteLink(userId: number, link: string): Promise<void> {
        linkStore.set(`link:${link}`, userId);
    }

    async trackInvite(inviterId: number, inviteeId: number): Promise<void> {
        const inviteData: InviteData = {
            inviterId,
            inviteeId,
            create_at: Date.now(),
        };

        inviteStore.set(`invite:${inviteeId}`, inviteData);

        const inviter = await this.getUser(inviterId);
        if (inviter) {
            inviter.invite_count += 1;
            await this.saveUser(inviter);
        }
    }

    async getInviteDataForUser(userId: number): Promise<InviteData | null> {
        return inviteStore.get(`invite:${userId}`) || null;
    }

    async getTopInviters(limit: number = 10): Promise<User[]> {
        const users: User[] = Array.from(userStore.values());

        return users
            .sort((a, b) => b.invite_count - a.invite_count)
            .slice(0, limit);
    }

    async getUserRank(userId: number): Promise<number> {
        const users = Array.from(userStore.values());

        const sortedUsers = users.sort((a, b) => b.invite_count - a.invite_count);

        const userPosition = sortedUsers.findIndex(u => u.id === userId);
        return userPosition === -1 ? 0 : userPosition + 1; // 1-based ranking
    }

    async clearAll(): Promise<void> {
        userStore.clear();
        inviteStore.clear();
        linkStore.clear();
    }
} 