/**
 * Mock chat threads (spec §8.12, DoR §13). Messages are local-only and are NOT
 * persisted (DoR §16.3 — no production chat messages persisted). Threads are
 * keyed by match id (the candidate's id).
 */
import { create } from 'zustand';
import type { ChatMessage } from '@/types';

let messageCounter = 0;
function nextMessageId(): string {
  messageCounter += 1;
  return `msg-${messageCounter}`;
}

/** Seed a couple of pre-existing conversations so Messages/Chat have content. */
const SEED_TS = '2026-07-02T18:00:00.000Z';
const SEED_THREADS: Record<string, ChatMessage[]> = {
  c02: [
    { id: 'seed-c02-1', matchId: 'c02', sender: 'them', text: 'Okay but which grocery store is the cinematic one?', timestamp: SEED_TS },
    { id: 'seed-c02-2', matchId: 'c02', sender: 'me', text: 'The one with the good lighting, obviously.', timestamp: SEED_TS },
  ],
  c08: [
    { id: 'seed-c08-1', matchId: 'c08', sender: 'them', text: 'I have a theory about our parking-spot compatibility.', timestamp: SEED_TS },
  ],
};

type ChatState = {
  threads: Record<string, ChatMessage[]>;
  ensureThread: (matchId: string) => void;
  sendMessage: (matchId: string, text: string) => ChatMessage;
  getThread: (matchId: string) => ChatMessage[];
  lastMessage: (matchId: string) => ChatMessage | undefined;
};

export const useChatStore = create<ChatState>((set, get) => ({
  threads: SEED_THREADS,

  ensureThread: (matchId) =>
    set((s) => (s.threads[matchId] ? s : { threads: { ...s.threads, [matchId]: [] } })),

  sendMessage: (matchId, text) => {
    const message: ChatMessage = {
      id: nextMessageId(),
      matchId,
      sender: 'me',
      text,
      timestamp: new Date().toISOString(),
    };
    set((s) => ({
      threads: { ...s.threads, [matchId]: [...(s.threads[matchId] ?? []), message] },
    }));
    return message;
  },

  getThread: (matchId) => get().threads[matchId] ?? [],
  lastMessage: (matchId) => {
    const thread = get().threads[matchId];
    return thread && thread.length > 0 ? thread[thread.length - 1] : undefined;
  },
}));
