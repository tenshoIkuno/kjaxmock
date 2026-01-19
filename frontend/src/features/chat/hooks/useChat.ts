import {
  deleteChat,
  getChat,
  getChats,
  updateChat,
} from '@/features/chat/api/chat';
import { useChatStore } from '@/features/chat/store/chatStore';
import { notifications } from '@mantine/notifications';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

// 特定のチャットルーム取得（Get）
export const useChat = (chatId: string | null) => {
  const chat = useChatStore((s) => s.chats.find((c) => c.id === chatId));

  const updateChat = useChatStore((s) => s.updateChat);
  const query = useQuery({
    queryKey: ['chat', chatId],
    queryFn: () => getChat(chatId!),
    enabled: !!chatId && !chat?.isNew, // chatIdがないとき、新規チャットの時は実行しない
  });

  // データ取得成功後にchatStoreにチャット情報をセット
  useEffect(() => {
    if (query.data) {
      updateChat(query.data);
    }
  }, [query.data, updateChat]);

  return query;
};

// チャットルーム一覧取得（Get）
export const useChats = () => {
  const setChats = useChatStore((s) => s.setChats);

  const query = useQuery({
    queryKey: ['chats'],
    queryFn: getChats,
  });

  // データ取得成功後にchatStoreにチャット情報をセット
  useEffect(() => {
    if (query.data) {
      setChats(query.data);
    }
  }, [query.data, setChats]);

  return query;
};

// チャットルーム削除（Delete）
export const useDeleteChat = () => {
  const queryClient = useQueryClient();

  const currentChatId = useChatStore((s) => s.currentChatId);
  const removeChat = useChatStore((s) => s.removeChat);
  const deselectChat = useChatStore((s) => s.deselectChat);

  return useMutation({
    mutationFn: deleteChat,
    onSuccess: (data) => {
      // store更新
      removeChat(data.id);
      // 削除対象が開いてるチャットの場合、currentChatIdの選択解除
      if (currentChatId == data.id) {
        deselectChat();
      }
      // 状態更新
      queryClient.invalidateQueries({ queryKey: ['chats'] });

      notifications.show({
        title: '削除成功',
        message: 'チャットルームを削除しました',
        color: 'green',
      });
    },
    onError: () => {
      notifications.show({
        title: '削除失敗',
        message: 'チャットルームを削除できませんでした',
        color: 'red',
      });
    },
  });
};

// チャットルーム更新（Patch）
export const useUpdateChat = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateChat,
    onSuccess: (data) => {
      // store更新
      useChatStore.getState().updateChat(data);
      // 状態更新
      queryClient.invalidateQueries({ queryKey: ['chats'] });

      notifications.show({
        title: '更新成功',
        message: 'チャットルーム名を更新しました',
        color: 'green',
      });
    },
    onError: () => {
      notifications.show({
        title: '更新に失敗しました',
        message: 'チャットルーム名を更新できませんでした。',
        color: 'red',
      });
    },
  });
};
