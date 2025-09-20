// src/types/notice.ts
export type NoticeType = 'MESSAGE' | 'MATCH_REQUESTED' | 'MATCH_ACCEPTED' | 'MATCH_DECLINED';

export interface Notice {
  id: number;                 // db id if persisted
  type: NoticeType;
  fromUserId?: number;
  fromName?: string;
  threadId?: number;          // for MESSAGE
  matchRequestId?: number;    // for request/accept/decline
  targetUserId?: number;      // optional
  title?: string;             // human strings for FCM / fallback
  body?: string;
  createdAt: string;          // ISO
  read?: boolean;
}
