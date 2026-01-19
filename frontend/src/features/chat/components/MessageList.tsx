// // frontend/src/features/chat/components/LeftSidebar/ClientList.tsxへ移行済み
// // 並び替えの処理など参考になるものがあるので削除せず保存している

// import { updateChat } from '@/features/chat/api/chat';
// import {
//   useChats,
//   useDeleteChat,
//   useUpdateChat,
// } from '@/features/chat/hooks/useChat';
// import { useChatStore } from '@/features/chat/store/chatStore';
// import type { Chat } from '@/features/chat/types/chatTypes';
// import {
//   DndContext,
//   PointerSensor,
//   closestCenter,
//   useSensor,
//   useSensors,
//   type DragEndEvent,
// } from '@dnd-kit/core';
// import {
//   restrictToParentElement,
//   restrictToVerticalAxis,
// } from '@dnd-kit/modifiers';
// import {
//   SortableContext,
//   arrayMove,
//   useSortable,
//   verticalListSortingStrategy,
// } from '@dnd-kit/sortable';
// import { CSS } from '@dnd-kit/utilities';
// import {
//   ActionIcon,
//   Button,
//   Modal,
//   NavLink,
//   Popover,
//   Stack,
//   TextInput,
// } from '@mantine/core';
// import {
//   IconDots,
//   IconGripVertical,
//   IconPencil,
//   IconTrash,
// } from '@tabler/icons-react';
// import {
//   useState,
//   type CSSProperties,
//   type MouseEvent,
//   type ReactNode,
// } from 'react';

// type ChatListItemProps = {
//   // チャットルーム情報（id, nameなど）
//   chat: Chat;
//   // このルームが現在選択中かどうか
//   isActive: boolean;
//   // 行がクリックされたときに呼ぶコールバック
//   onSelect: () => void;
//   // 左側に差し込むドラッグハンドル
//   dragHandle?: ReactNode;
// };

// type SortableChatRoomListItemProps = {
//   chat: Chat;
//   isActive: boolean;
//   disabled: boolean;
//   onSelect: () => void;
// };

// // Drag & Drop 対応版のラッパー
// function SortableChatRoomListItem({
//   chat,
//   isActive,
//   disabled,
//   onSelect,
// }: SortableChatRoomListItemProps) {
//   const { attributes, listeners, setNodeRef, transform, transition } =
//     useSortable({
//       id: chat.id,
//       disabled,
//     });

//   const style: CSSProperties = {
//     transform: CSS.Transform.toString(transform),
//     transition,
//   };

//   // 左側に表示するドラッグハンドル
//   const dragHandle = !disabled ? (
//     <ActionIcon
//       component="div"
//       size="sm"
//       variant="subtle"
//       // ハンドル部分だけドラッグ可能にする
//       {...attributes}
//       {...listeners}
//     >
//       <IconGripVertical size={16} />
//     </ActionIcon>
//   ) : null;

//   return (
//     <div ref={setNodeRef} style={style}>
//       <ChatRoomListItem
//         chat={chat}
//         isActive={isActive}
//         onSelect={onSelect}
//         dragHandle={dragHandle}
//       />
//     </div>
//   );
// }

// type ChatListProps = {
//   onChatClick?: () => void;
//   // 親コンポーネント側（Navbarなど）の検索バーに入力された文字列
//   chatsSearch: string;
// };

// function ChatRoomListItem({
//   chat,
//   isActive,
//   onSelect,
//   dragHandle,
// }: ChatListItemProps) {
//   const { mutate: deleteChat } = useDeleteChat();
//   const { mutate: updateChat } = useUpdateChat();

//   // 「…」メニュー（Popover）が開いているか
//   const [menuOpened, setMenuOpened] = useState(false);
//   // チャットルームの名前をインライン編集中かどうか
//   const [isEditing, setIsEditing] = useState(false);
//   // 編集中のルーム名の入力値
//   const [draftName, setDraftName] = useState(chat.title);
//   // 削除確認モーダルが開いているか
//   const [confirmOpen, setConfirmOpen] = useState(false);

//   // チャットルームの名前変更ボタン
//   const handleRenameClick = (event: MouseEvent) => {
//     // 親のクリック（ルーム選択）が動かないようにする
//     event.stopPropagation();
//     // メニューを閉じる
//     setMenuOpened(false);
//     // チャットルームの名前を編集開始
//     setDraftName(chat.title);
//     // 編集モードON
//     setIsEditing(true);
//   };

//   //削除ボタン
//   const handleDeleteClick = (event: MouseEvent) => {
//     // 親のクリック（ルーム選択）が動かないようにする
//     event.stopPropagation();
//     // メニューを閉じる
//     setMenuOpened(false);
//     // 削除確認モーダルを開く
//     setConfirmOpen(true);
//   };

//   // 削除確認モーダルの削除ボタン
//   const handleConfirmDelete = () => {
//     // チャットルーム削除実行
//     deleteChat(chat.id);
//     // モーダルを閉じる
//     setConfirmOpen(false);
//   };

//   // 削除確認モーダルのキャンセルボタン
//   const handleCancelDelete = () => {
//     // モーダルを閉じる
//     setConfirmOpen(false);
//   };

//   // チャットルームの名前変更
//   const commitRename = () => {
//     const trimmed = draftName.trim();
//     if (!trimmed) {
//       // 空文字なら元の名前に戻して終了
//       setDraftName(chat.title);
//       setIsEditing(false);
//       return;
//     }
//     if (trimmed !== chat.title) {
//       // 実際に名前変更を依頼
//       updateChat({ chatId: chat.id, payload: { title: trimmed } });
//     }
//     setIsEditing(false);
//   };

//   //  チャットルームの名前変更のキャンセル
//   const cancelRename = () => {
//     // 入力中の内容を捨て、元の名前に戻す
//     setDraftName(chat.title);
//     setIsEditing(false);
//   };

//   // チャットルームの名前変更
//   const labelNode = isEditing ? (
//     // TextInputを使ってインライン編集
//     <TextInput
//       value={draftName}
//       size="xs"
//       autoFocus
//       // 入力欄クリックでルーム選択イベントをブロックするためstopPropagation()にしてる
//       onClick={(e) => e.stopPropagation()}
//       onChange={(e) => setDraftName(e.currentTarget.value)}
//       onBlur={commitRename}
//       onKeyDown={(e) => {
//         if (e.key === 'Enter') {
//           commitRename();
//         } else if (e.key === 'Escape') {
//           cancelRename();
//         }
//       }}
//     />
//   ) : (
//     chat.title
//   );

//   // …のメニュー
//   const rightSection = (
//     <Popover
//       opened={menuOpened}
//       onChange={setMenuOpened}
//       withArrow
//       position="right"
//       shadow="md"
//     >
//       <Popover.Target>
//         <ActionIcon
//           component="div"
//           size="sm"
//           variant="subtle"
//           onClick={(e) => {
//             e.stopPropagation();
//             setMenuOpened((prev) => !prev);
//           }}
//         >
//           <IconDots size={14} />
//         </ActionIcon>
//       </Popover.Target>
//       <Popover.Dropdown
//         p="xs"
//         onClick={(e) => e.stopPropagation()}
//         data-inner-popover
//       >
//         <Stack gap={2}>
//           <Button
//             fullWidth
//             justify="flex-start"
//             variant="subtle"
//             size="xs"
//             leftSection={<IconPencil size={14} />}
//             onClick={handleRenameClick}
//           >
//             名前を変更する
//           </Button>
//           <Button
//             fullWidth
//             justify="flex-start"
//             variant="subtle"
//             size="xs"
//             color="red"
//             leftSection={<IconTrash size={14} />}
//             onClick={handleDeleteClick}
//           >
//             削除する
//           </Button>
//         </Stack>
//       </Popover.Dropdown>
//     </Popover>
//   );

//   return (
//     <>
//       <NavLink
//         // 左側にドラッグ用のハンドルを表示
//         leftSection={dragHandle}
//         component="button"
//         label={labelNode}
//         active={isActive}
//         onClick={() => {
//           if (!isEditing) {
//             onSelect();
//           }
//         }}
//         rightSection={rightSection}
//       />

//       <Modal
//         opened={confirmOpen}
//         onClose={handleCancelDelete}
//         title="チャットルームを削除しますか？"
//         centered
//         data-modal-root
//         zIndex={1000}
//       >
//         <Stack gap="sm">
//           <p>「{chat.title}」を削除すると、履歴は元に戻せません。</p>
//           <Stack gap="xs" justify="flex-end">
//             <Button variant="default" onClick={handleCancelDelete}>
//               キャンセル
//             </Button>
//             <Button color="red" onClick={handleConfirmDelete}>
//               削除する
//             </Button>
//           </Stack>
//         </Stack>
//       </Modal>
//     </>
//   );
// }

// // チャットルーム（MessageList）
// export function MessageList({ onChatClick, chatsSearch }: ChatListProps) {
//   useChats();
//   // chatStoreからselectChat関数とcurrentChatIdを取得
//   const chats = useChatStore((s) => s.chats);
//   const currentChatId = useChatStore((s) => s.currentChatId);
//   const setChats = useChatStore((s) => s.setChats);
//   const selectChat = useChatStore((s) => s.selectChat);

//   // 検索バーに入力された文字列（大文字小文字を区別しないように小文字化して扱う）
//   const normalizedSearch = chatsSearch.trim().toLowerCase();
//   // 検索中かの判定 検索中は並び替えできないようにするため
//   const isFiltering = normalizedSearch !== '';
//   // 検索文字列が空なら全件表示、そうでなければ、タイトルに検索文字列が含まれるチャットだけを表示対象にする。
//   const displayedChats =
//     normalizedSearch === ''
//       ? chats
//       : chats.filter((chat) =>
//           chat.title.toLowerCase().includes(normalizedSearch),
//         );

//   // Drag & Drop 用のセンサー（マウス・タッチ操作の開始条件など）
//   const sensors = useSensors(
//     useSensor(PointerSensor, {
//       activationConstraint: {
//         distance: 5, // クリックとの誤爆を防ぐため、少しドラッグしたら発火
//       },
//     }),
//   );

//   // ドラッグ終了時に呼ばれる。ここで Context に順番変更を反映する
//   const handleDragEnd = (event: DragEndEvent) => {
//     const { active, over } = event;
//     if (!over) return;

//     const activeId = String(active.id);
//     const overId = String(over.id);
//     const currentOrder = chats.map((c) => c.id);
//     const oldIndex = currentOrder.indexOf(activeId);
//     const newIndex = currentOrder.indexOf(overId);

//     // 並び替え
//     const newOrdered = arrayMove(chats, oldIndex, newIndex);
//     // uiに反映
//     setChats(newOrdered);

//     const movedItem = newOrdered[newIndex];
//     const prevItem = newOrdered[newIndex - 1];
//     const nextItem = newOrdered[newIndex + 1];

//     // sort_index作成アルゴリズム
//     let newSortIndex: number;
//     // 唯一の場合
//     if (!prevItem && !nextItem) {
//       newSortIndex = 100.0;
//       // 先頭の場合
//     } else if (!prevItem) {
//       newSortIndex = nextItem?.sort_index + 100.0;
//       // 末尾の場合
//     } else if (!nextItem) {
//       newSortIndex = prevItem.sort_index / 2;
//       // 中間の場合
//     } else {
//       newSortIndex = (prevItem.sort_index + nextItem.sort_index) / 2;
//     }

//     // サーバに反映
//     updateChat({
//       chatId: movedItem.id,
//       payload: { sort_index: newSortIndex },
//     });
//   };

//   return (
//     <Stack gap="sm">
//       <Stack gap="xs">
//         <DndContext
//           sensors={sensors}
//           collisionDetection={closestCenter}
//           onDragEnd={handleDragEnd}
//           modifiers={[restrictToVerticalAxis, restrictToParentElement]}
//           autoScroll={false}
//         >
//           <SortableContext
//             // 並び替え対象となるIDの配列、検索のとき、絞り込まれたチャットのみを対象
//             items={
//               isFiltering ? [] : (displayedChats?.map((chat) => chat.id) ?? [])
//             }
//             strategy={verticalListSortingStrategy}
//           >
//             {displayedChats?.map((chat) => (
//               <SortableChatRoomListItem
//                 key={chat.id}
//                 chat={chat}
//                 isActive={chat.id === currentChatId}
//                 disabled={isFiltering}
//                 onSelect={() => {
//                   // ルームを選択
//                   selectChat(chat.id);
//                   // Navbar から渡された「ルームクリック時の処理」があれば実行（ポップアップを閉じる）
//                   onChatClick?.();
//                 }}
//               />
//             ))}
//           </SortableContext>
//         </DndContext>
//       </Stack>
//     </Stack>
//   );
// }
