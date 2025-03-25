import type { InviteData, User } from '../types';
import { MockStorageService } from './mockStorage';
import { SupabaseStorageService } from './supabaseStorage';

export interface StorageService {
    getUser(userId: number): Promise<User | null>;
    saveUser(user: User): Promise<void>;

    getUserByInviteLink(link: string): Promise<number | null>;
    saveInviteLink(userId: number, link: string): Promise<void>;

    trackInvite(inviterId: number, inviteeId: number): Promise<void>;
    getInviteDataForUser(userId: number): Promise<InviteData | null>;

    getTopInviters(limit?: number): Promise<User[]>;
    getUserRank(userId: number): Promise<number>;
}

export function getStorageService(): StorageService {
    if (process.env.NODE_ENV === 'production') {
        return new SupabaseStorageService();
    } else {
        return new MockStorageService();
    }
} 