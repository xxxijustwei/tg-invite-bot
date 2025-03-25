export interface User {
    id: number;
    username?: string;
    firstName: string;
    lastName?: string;
    inviteCount: number;
    inviteLink?: string;
}

export interface RankEntry {
    userId: number;
    username?: string;
    firstName: string;
    lastName?: string;
    inviteCount: number;
    rank: number;
}

export interface InviteData {
    inviterId: number;
    inviteeId: number;
    timestamp: number;
} 