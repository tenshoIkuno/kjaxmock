import {
  createClient,
  deleteClient,
  getClients,
  updateClient,
} from '@/features/client/api/client';
import type {
  ClientUpdatePayload,
  CreateClientPayload,
} from '@/features/client/types/clientTypes';
import { notifications } from '@mantine/notifications';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// --- クライアント一覧取得 ---
// React Query で顧問先一覧を取得し、クライアント側キャッシュに保持
export const useClients = () => {
  const query = useQuery({
    queryKey: ['clients'],
    queryFn: getClients,
  });

  return query;
};

// --- クライアント作成 ---
// 顧問先を作成する mutation。成功時に一覧キャッシュを無効化して再フェッチさせる。
export const useCreateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateClientPayload) => createClient(payload),

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      notifications.show({
        title: '作成成功',
        message: `顧問先「${data.name}」を作成しました`,
        color: 'green',
      });
    },

    onError: () => {
      notifications.show({
        title: '作成失敗',
        message: '顧問先の作成に失敗しました。',
        color: 'red',
      });
    },
  });
};

// --- クライアント更新 ---
export const useUpdateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      clientId,
      payload,
    }: {
      clientId: string;
      payload: ClientUpdatePayload;
    }) => updateClient({ clientId, payload }),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      notifications.show({
        title: '更新成功',
        message: '顧問先情報を更新しました。',
        color: 'green',
      });
    },

    onError: () => {
      notifications.show({
        title: '更新失敗',
        message: '顧問先情報の更新に失敗しました。',
        color: 'red',
      });
    },
  });
};

// --- クライアント削除 ---
export const useDeleteClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (clientId: string) => deleteClient(clientId),

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      notifications.show({
        title: '削除成功',
        message: `顧問先「${data.name}」を削除しました。`,
        color: 'green',
      });
    },

    onError: () => {
      notifications.show({
        title: '削除失敗',
        message: '顧問先の削除に失敗しました。',
        color: 'red',
      });
    },
  });
};
