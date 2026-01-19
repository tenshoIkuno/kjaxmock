import type { ChatState } from '@/features/chat/types/chatTypes';
import { create } from 'zustand';

export const useChatStore = create<ChatState>((set) => ({
  // ### 状態一覧 ###
  // すべてのチャット情報を持つ状態
  chats: [],
  // 選択中のチャットIDの状態
  currentChatId: null,
  // 受信中のメッセージ情報を持つ状態
  streamingMessages: {},

  // ### アクション一覧 ###
  // -- chats操作アクション --
  // chatsにchat[]をマージするアクション
  setChats: (chat) =>
    set((state) => ({
      chats: chat.map((inc) => {
        const exist = state.chats.find((c) => c.id === inc.id);

        return {
          ...(exist ?? {}),
          ...inc,
          messages:
            inc.messages === undefined ? (exist?.messages ?? []) : inc.messages,
        };
      }),
    })),
  // chatsにchatをセットするアクション
  // chatsの先頭に追加し、currentChatId も更新する
  addChat: (chat) =>
    set((state) => ({
      chats: [{ ...chat, isNew: true }, ...state.chats],
      currentChatId: chat.id,
    })),
  // chatsの中にあるchatを更新するアクション
  // chatId、title情報のみ保持していた状態に、後から取得したmessages情報も追加する時に使用
  updateChat: (chat) =>
    set((state) => ({
      chats: state.chats.map((c) => (c.id === chat.id ? { ...c, ...chat } : c)),
    })),
  // chatsの中にある指定したchatを削除するアクション
  removeChat: (chatId: string) =>
    set((state) => ({
      chats: state.chats.filter((c) => c.id !== chatId),
    })),

  // -- currentChatId操作アクション --
  // currentChatIdに引数のidをセット
  selectChat: (chatId) => set({ currentChatId: chatId }),
  // currentChatIdにnullをセット
  deselectChat: () => set({ currentChatId: null }),

  // -- chatsリスト内のmessages操作アクション --
  // chatIdとChatMessageを指定し、chatsの中にある一致するIdのchatにChatMessageを追加
  // 送信ボタン押下後のユーザメッセージの表示に使用
  addMessage: (chatId, message) =>
    set((state) => ({
      chats: state.chats.map((c) =>
        c.id === chatId
          ? {
              ...c,
              messages: [...c.messages, message],
            }
          : c,
      ),
    })),
  // chatIdとmessageIdを指定し、指定されたメッセージのcontentを追加更新するアクション
  // SSEのストリーミングでAI応答の部分的なチャンクを受け取った際に、既存メッセージに追記していく用途で使用
  updateMessage: (chatId, messageId, content) =>
    set((state) => ({
      chats: state.chats.map((chat) =>
        chat.id === chatId
          ? {
              ...chat,
              messages: chat.messages.map((m) =>
                m.id === messageId ? { ...m, content: m.content + content } : m,
              ),
            }
          : chat,
      ),
    })),

  // --- streamingMessages操作アクション ---
  // chatIdとChatMessageを指定し、chatsの中にある一致するIdのchatにChatMessageを追加
  // 送信ボタン押下後AIの空メッセージの表示に使用
  addStreamingMessage: (chatId, message) =>
    set((state) => ({
      streamingMessages: {
        ...state.streamingMessages,
        [chatId]: {
          ...(state.streamingMessages[chatId] ?? {}),
          [message.id]: message,
        },
      },
    })),
  // chatIdとmessageIdを指定し、指定されたメッセージのcontentを追加更新するアクション
  // SSEのストリーミングでAI応答の部分的なチャンクを受け取った際に、既存メッセージに追記していく用途で使用
  updateStreamingMessage: (chatId, messageId, content) =>
    set((state) => ({
      streamingMessages: {
        ...state.streamingMessages,
        [chatId]: {
          ...(state.streamingMessages[chatId] ?? {}),
          [messageId]: {
            ...(state.streamingMessages[chatId] ?? {})[messageId],
            content:
              (state.streamingMessages[chatId]?.[messageId]?.content ?? '') +
              content,
          },
        },
      },
    })),
  // ストリーミング中メッセージを確定し、chatsへ反映させるアクション
  // 生成完了時に呼び出される。streamingMessagesからは削除する。
  commitStreamingMessage: (chatId, messageId) =>
    set((state) => {
      const message = state.streamingMessages[chatId]?.[messageId];
      if (!message) return state;
      return {
        chats: state.chats.map((c) =>
          c.id === chatId
            ? {
                ...c,
                messages: [...c.messages, message],
              }
            : c,
        ),
        streamingMessages: {
          ...state.streamingMessages,
          [chatId]: Object.fromEntries(
            Object.entries(state.streamingMessages[chatId]).filter(
              ([id]) => id !== messageId,
            ),
          ),
        },
      };
    }),
  // streamingMessagesからchatIdとmessageIdを指定して削除するアクション
  // 生成中止やエラー時に使用
  clearStreamingMessage: (chatId, messageId) =>
    set((state) => ({
      streamingMessages: {
        ...state.streamingMessages,
        [chatId]: Object.fromEntries(
          Object.entries(state.streamingMessages[chatId] ?? {}).filter(
            ([id]) => id !== messageId,
          ),
        ),
      },
    })),
}));
