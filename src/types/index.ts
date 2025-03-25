export interface User {
    id: number;
    username?: string;
    first_name: string;
    last_name?: string;
    invite_count: number;
    invite_link?: string;
}

export interface RankEntry {
    userId: number;
    username?: string;
    first_name: string;
    last_name?: string;
    invite_count: number;
    rank: number;
}

export interface InviteData {
    inviterId: number;
    inviteeId: number;
    create_at: number;
} 