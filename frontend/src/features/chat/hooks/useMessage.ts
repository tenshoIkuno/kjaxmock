// メッセージ送信時に実行するフック
import { API_BASE_URL } from '@/common/api/client';
import { getCsrfToken } from '@/common/utils/getCsrfToken';
import { useChatStore } from '@/features/chat/store/chatStore';
import type { UpdateChat } from '@/features/chat/types/chatTypes';
import { useClientStore } from '@/features/client/store/clientStore';
import { useCallback, useState } from 'react';

export const useChatStream = () => {
  // useChatStoreから各種操作を取得
  // チャット系アクション
  const addMessage = useChatStore((s) => s.addMessage);
  const addChat = useChatStore((s) => s.addChat);
  const updateChat = useChatStore((s) => s.updateChat);

  // メッセージ系アクション
  const addStreamingMessage = useChatStore((s) => s.addStreamingMessage);
  const updateStreamingMessage = useChatStore((s) => s.updateStreamingMessage);
  const commitStreamingMessage = useChatStore((s) => s.commitStreamingMessage);

  // 選択中の顧問先Id
  const currentClientId = useClientStore((s) => s.currentClientId);

  const [isStreaming, setIsStreaming] = useState(false);

  const sendMessage = useCallback(
    async (currentChatId: string | null, prompt: string) => {
      setIsStreaming(true);

      // 送信先のチャットID決定（新規チャットなら作成）
      const chatId = currentChatId ?? crypto.randomUUID();
      if (!currentChatId) {
        addChat({
          id: chatId,
          title: '新規チャット',
          messages: [],
          client_id: currentClientId,
          // sort_index: 0,
        });
      }

      // ユーザメッセージを追加
      addMessage(chatId, {
        id: crypto.randomUUID(),
        role: 'user',
        content: prompt,
        created_at: new Date(),
      });

      // アシスタント用の空のメッセージを追加
      const aiMessageId = crypto.randomUUID();
      addStreamingMessage(chatId, {
        id: aiMessageId,
        role: 'assistant',
        content: '',
        created_at: new Date(),
      });

      try {
        // CookieからCSRFトークンを取得
        const csrfToken = getCsrfToken();

        // モック環境: 実ネットワークを使わず疑似ストリーミングを実行
        const simulatedResponse = `モック応答: ${prompt}`;
        let buffer = '';
        for (const ch of simulatedResponse) {
          // 少しの遅延でトークンを増やす
          await new Promise((r) => setTimeout(r, 30));
          buffer += ch;
          updateStreamingMessage(chatId, aiMessageId, buffer);
        }
        // メタデータ更新（タイトルなどが変更される想定）
        updateChat({ id: chatId, title: `会話: ${simulatedResponse.slice(0, 12)}...` });
        commitStreamingMessage(chatId, aiMessageId);
      } finally {
        setIsStreaming(false);
      }
    },
    [
      addChat,
      addMessage,
      updateChat,
      addStreamingMessage,
      updateStreamingMessage,
      commitStreamingMessage,
      currentClientId,
    ],
  );

  return { sendMessage, isStreaming };
};
