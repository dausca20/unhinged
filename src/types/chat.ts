/** Local mock chat (spec §8.12, DoR §13). No real backend messaging. */
export type ChatSender = 'me' | 'them';

export type ChatMessage = {
  id: string;
  matchId: string;
  sender: ChatSender;
  text: string;
  timestamp: string;
};
