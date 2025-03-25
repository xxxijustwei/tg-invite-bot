import { createClient } from '@supabase/supabase-js';
import type { InviteData, User } from '../types';
import { config } from '../config';

const supabase = createClient(
    config.SUPABASE_URL,
    config.SUPABASE_SERVICE_KEY
);

export class SupabaseStorageService {
    // 用户操作
    async getUser(userId: number): Promise<User | null> {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        if (error || !data) {
            return null;
        }

        return data as User;
    }

    async saveUser(user: User): Promise<void> {
        const { error } = await supabase
            .from('users')
            .upsert(user, { onConflict: 'id' });

        if (error) {
            console.error('Failed to save user:', error);
            throw new Error(`Failed to save user: ${error.message}`);
        }
    }

    async getUserByInviteLink(link: string): Promise<number | null> {
        const { data, error } = await supabase
            .from('invite_links')
            .select('user_id')
            .eq('link_id', link)
            .single();

        if (error || !data) {
            return null;
        }

        return data.user_id;
    }

    async saveInviteLink(userId: number, link: string): Promise<void> {
        const { error } = await supabase
            .from('invite_links')
            .upsert({
                user_id: userId,
                link_id: link,
                created_at: new Date().toISOString()
            }, { onConflict: 'link_id' });

        if (error) {
            console.error('Failed to save invite link:', error);
            throw new Error(`Failed to save invite link: ${error.message}`);
        }
    }

    async trackInvite(inviterId: number, inviteeId: number): Promise<void> {
        const timestamp = new Date().toISOString();

        const { error: inviteError } = await supabase
            .from('invites')
            .upsert({
                inviter_id: inviterId,
                invitee_id: inviteeId,
                timestamp
            }, { onConflict: 'invitee_id' });

        if (inviteError) {
            console.error('Failed to track invite:', inviteError);
            throw new Error(`Failed to track invite: ${inviteError.message}`);
        }

        const inviter = await this.getUser(inviterId);
        if (inviter) {
            inviter.inviteCount = (inviter.inviteCount || 0) + 1;
            await this.saveUser(inviter);
        }
    }

    async getInviteDataForUser(userId: number): Promise<InviteData | null> {
        const { data, error } = await supabase
            .from('invites')
            .select('*')
            .eq('invitee_id', userId)
            .single();

        if (error || !data) {
            return null;
        }

        return {
            inviterId: data.inviter_id,
            inviteeId: data.invitee_id,
            timestamp: new Date(data.timestamp).getTime()
        };
    }

    async getTopInviters(limit: number = 10): Promise<User[]> {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .order('inviteCount', { ascending: false })
            .limit(limit);

        if (error || !data) {
            return [];
        }

        return data as User[];
    }

    async getUserRank(userId: number): Promise<number> {
        const { data, error } = await supabase
            .from('users')
            .select('id, inviteCount')
            .order('inviteCount', { ascending: false });

        if (error || !data) {
            return 0;
        }

        const userPosition = data.findIndex(u => u.id === userId);
        return userPosition === -1 ? 0 : userPosition + 1; // 1-based ranking
    }
} 