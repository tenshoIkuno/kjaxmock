import { ActionButton } from '@/common/dashboard/ActionButton';
import { DeleteModal } from '@/common/dashboard/DeleteModal';
import { useCommonStore } from '@/common/store/commonStore';
import {
  useChats,
  useDeleteChat,
  useUpdateChat,
} from '@/features/chat/hooks/useChat';
import { useChatStore } from '@/features/chat/store/chatStore';
import type { Chat } from '@/features/chat/types/chatTypes';
import { useClients } from '@/features/client/hooks/useClient';
import { useClientStore } from '@/features/client/store/clientStore';
import {
  Box,
  Button,
  Center,
  Collapse,
  Loader,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
} from '@mantine/core';
import {
  IconFolder,
  IconPencil,
  IconPlus,
  IconTrash,
} from '@tabler/icons-react';
import { useState } from 'react';

export const ClientList = ({
  searchText,
  onChatClick,
}: {
  searchText: string;
  onChatClick?: () => void;
}) => {
  // 初期取得
  useChats();
  // useClientStoreから選択されている顧問先Idと顧問先セットアクション取得
  const currentClientId = useClientStore((s) => s.currentClientId);
  const selectClient = useClientStore((s) => s.selectClient);

  // currentChatIdをセットするアクション
  const chats = useChatStore((s) => s.chats);
  const currentChatId = useChatStore((s) => s.currentChatId);
  const selectChat = useChatStore((s) => s.selectChat);

  // 表示画面をセットするアクション
  const select = useCommonStore((s) => s.select);

  // クライアント一覧取得
  const { data: clients, isLoading, isError } = useClients();

  // useChatsから、編集・削除関数取得
  const { mutate: updateChat } = useUpdateChat();
  const { mutate: deleteChat } = useDeleteChat();

  // 編集中のChatId
  const [editingChat, setEditingChat] = useState<Chat | null>(null);
  // 編集中のタイトル
  const [draftTitle, setDraftTitle] = useState('');
  // 削除対象Chat
  const [deleteTargetChat, setDeleteTargetChat] = useState<Chat | null>(null);
  // 開いているClientIdの保持
  const [openId, setOpenId] = useState<string | null>(currentClientId);
  // モーダル状態
  const [confirmOpen, setConfirmOpen] = useState(false);

  // フィルタリング処理
  const filteredClients = (clients ?? []).filter((client) =>
    client.name.toLowerCase().includes(searchText.toLowerCase()),
  );

  // ローディング、エラー処理
  if (isLoading)
    return (
      <Center>
        <Loader />
      </Center>
    );
  if (isError) return <div>データの取得に失敗しました</div>;

  // 新規作成クリック時の処理
  const handleNewCreateClick = (clientId: string) => {
    // クライアントのセット
    selectClient(clientId);
    // currentChatIdをnullに
    selectChat(null);
    // chatページをセット
    select('chat');
  };

  // 顧問先ディレクトリ内のチャットクリック時の処理
  const handleChatClick = (clientId: string, chatId: string) => {
    // クライアントのセット
    selectClient(clientId);
    // currentChatIdにchatIdをセット
    selectChat(chatId);
    // chatページをセット
    select('chat');
  };

  // チャットルームの名前変更
  const commitRename = (chat: Chat) => {
    const trimmed = draftTitle.trim();
    // 空文字なら元の名前に戻して終了
    if (!trimmed) {
      setDraftTitle(chat.title);
      setEditingChat(null);
      return;
    }
    if (trimmed !== chat.title) {
      // ui更新
      useChatStore.getState().updateChat({ ...chat, title: trimmed });
      // サーバ更新
      updateChat({ chatId: chat.id, payload: { title: trimmed } });
    }
    setEditingChat(null);
  };

  //  チャットルームの名前変更のキャンセル
  const cancelRename = (chat: Chat) => {
    // 入力中の内容を捨て、元の名前に戻す
    setDraftTitle(chat.title);
    setEditingChat(null);
  };

  return (
    <>
      <Stack gap={0}>
        {/* 取得した顧問先とそれに紐づくチャットのリストを作成 */}
        {filteredClients?.map((client) => {
          // 顧問先内のチャットルーム数をカウント
          const chatCount = chats.filter(
            (c) => c.client_id === client.id,
          ).length;

          return (
            <Box key={client.id}>
              {/* 顧問先 */}
              <Button
                variant={openId === client.id ? 'light' : 'subtle'}
                color="dark"
                leftSection={<IconFolder />}
                rightSection={
                  <ThemeIcon size="xs" radius="xl" variant="light" color="blue">
                    <Text size="xs" fw={500}>
                      {chatCount}
                    </Text>
                  </ThemeIcon>
                }
                fullWidth
                justify="flex-start"
                onClick={() =>
                  setOpenId((prev) => (prev === client.id ? null : client.id))
                }
              >
                <Text size="sm" fw={500} truncate="end">
                  {client.name}
                </Text>
              </Button>
              <Collapse in={openId === client.id}>
                {/* 新規作成ボタン */}
                <Button
                  variant="white"
                  size="xs"
                  fullWidth
                  leftSection={<IconPlus size={16} />}
                  justify="center"
                  pr={34}
                  onClick={() => handleNewCreateClick(client.id)}
                >
                  <Text size="sm">新規作成</Text>
                </Button>
                <Stack gap={0}>
                  {/* 顧問先に紐づくチャット履歴 */}
                  {chats
                    ?.filter((chat) => chat.client_id === client.id)
                    .map((chat) => (
                      <Button
                        key={chat.id}
                        variant={currentChatId === chat.id ? 'light' : 'subtle'}
                        color="dark"
                        size="xs"
                        justify="space-between"
                        ml={24}
                        rightSection={
                          // 削除編集ボタン
                          editingChat?.id === chat.id ? null : (
                            <ActionButton
                              triggerComponent="div"
                              actions={[
                                {
                                  label: '名前を変更',
                                  icon: <IconPencil size={14} />,
                                  onClick: () => {
                                    setEditingChat(chat);
                                    setDraftTitle(chat.title);
                                  },
                                },
                                {
                                  label: '削除する',
                                  icon: <IconTrash size={14} />,
                                  color: 'red',
                                  onClick: () => {
                                    setDeleteTargetChat(chat);
                                    setConfirmOpen(true);
                                  },
                                },
                              ]}
                            />
                          )
                        }
                        onClick={() => {
                          handleChatClick(chat.client_id!, chat.id);
                          onChatClick?.();
                        }}
                      >
                        {/* 編集中に表示するTextInput */}
                        {editingChat?.id === chat.id ? (
                          <TextInput
                            value={draftTitle}
                            size="sm"
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) =>
                              setDraftTitle(e.currentTarget.value)
                            }
                            onBlur={() => commitRename(chat)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                commitRename(chat);
                              } else if (e.key === 'Escape') {
                                cancelRename(chat);
                              }
                            }}
                            rightSection="enter"
                            styles={{
                              input: {
                                fontWeight: 'normal',
                                height: '25px',
                                minHeight: 20,
                              },
                            }}
                          />
                        ) : (
                          <Text size="sm">{chat.title}</Text>
                        )}
                      </Button>
                    ))}
                </Stack>
              </Collapse>
            </Box>
          );
        })}
      </Stack>

      {/* 削除確認モーダル */}
      <DeleteModal
        opened={confirmOpen}
        title="チャットルームを削除しますか？"
        message={
          deleteTargetChat
            ? `「${deleteTargetChat.title}」を削除すると、履歴は元に戻せません。`
            : ''
        }
        onConfirm={() => {
          if (deleteTargetChat) deleteChat(deleteTargetChat.id);
          setConfirmOpen(false);
        }}
        onCancel={() => {
          setConfirmOpen(false);
          setDeleteTargetChat(null);
        }}
      />
    </>
  );
};
