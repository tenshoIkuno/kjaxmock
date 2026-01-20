import { ActionButton } from '@/common/dashboard/ActionButton';
import { DashboardLayout } from '@/common/dashboard/Dashboard';
import { DeleteModal } from '@/common/dashboard/DeleteModal';
import { List } from '@/common/dashboard/List';
import { DashboardModal } from '@/common/dashboard/Modal';
import { ClientForm } from '@/features/client/components/ClientForm';
import { useClients, useDeleteClient } from '@/features/client/hooks/useClient';
import type { Client } from '@/features/client/types/clientTypes';
import {
  Button,
  LoadingOverlay,
  Text,
  TextInput,
  Flex,
  Box,
  Paper,
  Textarea,
  Group,
  Tabs,
  Title,
  Grid,
  SimpleGrid,
  Divider,
  ActionIcon,
} from '@mantine/core';
import TooltipHelpButton from '@/common/components/TooltipHelpButton';
import { openOnboarding } from '@/common/components/Onboarding/controller';
import { useForm } from '@mantine/form';
import { useUpdateClient } from '@/features/client/hooks/useClient';
import {
  IconPencil,
  IconPlus,
  IconSearch,
  IconTrash,
} from '@tabler/icons-react';
import { useState, useEffect } from 'react';

export const ClientPage = () => {
  // 顧問先登録モーダルの開閉状態
  const [formMode, setFormMode] = useState<'create' | 'edit' | null>(null);
  // 削除確認モーダルの開閉状態
  const [deleteModalOpend, setDeleteModalOpend] = useState(false);
  // 編集or削除中のclient保持
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // クライアント一覧取得
  const { data: clients, isLoading, isError } = useClients();
  const { mutate: deleteClient } = useDeleteClient();

  // フィルター状態
  const [searchText, setSearchText] = useState('');

  // 作成・編集モーダルの開閉状態
  const isFormModalOpened = formMode === 'create';

  // 編集中はタイトル・ラベル・検索欄を非表示にする
  const isEditingMain = formMode === 'edit' && selectedClient;
  const headerTitle = isEditingMain ? '' : '顧問先管理';
  const headerLabel = isEditingMain ? '' : '顧問先の登録、編集、削除ができます';
  const filterAreaNode = isEditingMain ? undefined : (
    <TextInput
      placeholder="顧問先名で検索"
      leftSection={<IconSearch size={16} />}
      value={searchText}
      onChange={(e) => setSearchText(e.currentTarget.value)}
    />
  );

  // フィルタリング処理
  const filteredClients = (clients ?? []).filter((client) =>
    client.name.toLowerCase().includes(searchText.toLowerCase()),
  );

  const columns = [
    { key: 'name', label: '顧問先名' },
    {
      key: 'corporate_num',
      label: '法人番号',
      render: (client: Client) =>
        (client as any).corporate_num ?? (client as any).corporateNumber ?? '-',
    },
    {
      key: 'phone',
      label: '電話番号',
      render: (client: Client) =>
        (client as any).phone ?? (client as any).phone_num ?? '-',
    },
    {
      key: 'email',
      label: 'メールアドレス',
      render: (client: Client) =>
        (client as any).email ?? (client as any).mail_address ?? '-',
    },
    {
      key: 'address',
      label: '住所',
      render: (client: Client) => (client as any).address ?? '-',
    },
    // カラムに...ボタン（編集・削除）追加
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (client: Client) => (
        <ActionButton
          actions={[
            {
              label: '顧問先を編集',
              icon: <IconPencil size={14} />,
              onClick: () => {
                setSelectedClient(client);
                setFormMode('edit');
              },
            },
            {
              label: '削除する',
              icon: <IconTrash size={14} />,
              color: 'red',
              onClick: () => {
                setSelectedClient(client);
                setDeleteModalOpend(true);
              },
            },
          ]}
          iconSize={18}
        />
      ),
      style: { textAlign: 'right' },
    },
  ] as const;

  // 編集フォーム（タブ内で使用）
  const { mutate: updateClient, isPending: isUpdatePending } =
    useUpdateClient();

  const editForm = useForm({
    initialValues: {
      established: '',
      client_type: '',
      industry_category_major: '',
      industry_category_minor: '',
      corporate_num: '',
      invoice_num: '',
      fiscal_end_day: '',
      address: '',
      phone: '',
      email: '',
      tax_office_code: '',
      tax_office_name: '',
      note: '',
      contacts: [] as any[],
      engagements: [] as any[],
      owners: [] as any[],
    },
  });

  useEffect(() => {
    if (selectedClient) {
      editForm.setValues({
        id: (selectedClient as any).id ?? '',
        tenant_id: (selectedClient as any).tenant_id ?? '',
        name: selectedClient.name ?? '',
        established: (selectedClient as any).established ?? '',
        client_type: (selectedClient as any).client_type ?? '',
        industry_category_major:
          (selectedClient as any).industry_category_major ?? '',
        industry_category_minor:
          (selectedClient as any).industry_category_minor ?? '',
        corporate_num:
          (selectedClient as any).corporate_num ??
          (selectedClient as any).corporateNumber ??
          '',
        invoice_num: (selectedClient as any).invoice_num ?? '',
        fiscal_end_day: (selectedClient as any).fiscal_end_day ?? '',
        address: (selectedClient as any).address ?? '',
        phone: (selectedClient as any).phone ?? '',
        email: (selectedClient as any).email ?? '',
        tax_office_code: (selectedClient as any).tax_office_code ?? '',
        tax_office_name: (selectedClient as any).tax_office_name ?? '',
        note: (selectedClient as any).note ?? '',
        contacts: (selectedClient as any).contacts ?? [],
        engagements: (selectedClient as any).engagements ?? [],
        owners: (selectedClient as any).owners ?? [],
      });
    }
  }, [selectedClient]);

  const setContactField = (index: number, field: string, value: any) => {
    const arr = [...(editForm.values.contacts ?? [])];
    arr[index] = { ...(arr[index] ?? {}), [field]: value };
    editForm.setValues({ ...editForm.values, contacts: arr });
  };

  const addContact = () => {
    const arr = [
      ...(editForm.values.contacts ?? []),
      {
        name: '',
        manager_name: '',
        phone_num: '',
        mail_address: '',
        fax_num: '',
      },
    ];
    editForm.setValues({ ...editForm.values, contacts: arr });
  };

  const setEngagementField = (index: number, field: string, value: any) => {
    const arr = [...(editForm.values.engagements ?? [])];
    arr[index] = { ...(arr[index] ?? {}), [field]: value };
    editForm.setValues({ ...editForm.values, engagements: arr });
  };

  const setOwnerField = (index: number, field: string, value: any) => {
    const arr = [...(editForm.values.owners ?? [])];
    arr[index] = { ...(arr[index] ?? {}), [field]: value };
    editForm.setValues({ ...editForm.values, owners: arr });
  };

  // inline edit component (shown in main area when editing)
  const ClientInlineEdit: React.FC<{ client: Client; onClose: () => void }> = ({
    client,
    onClose,
  }) => {
    const form = useForm({
      initialValues: {
        name: client.name ?? '',
        address: (client as any).address ?? '',
        phone: (client as any).phone ?? '',
        email: (client as any).email ?? '',
        note: (client as any).note ?? '',
      },
    });

    const { mutate: updateClient, isPending } = useUpdateClient();

    const handleSubmit = form.onSubmit((values) => {
      updateClient(
        { clientId: client.id, payload: { name: values.name } },
        { onSuccess: () => onClose() },
      );
    });

    return (
      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
      >
        <TextInput
          label={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>顧問先名</span>
              <TooltipHelpButton
                tip="顧問先の正式名称を入力してください"
                size={18}
              />
            </div>
          }
          {...form.getInputProps('name')}
          required
        />
        <TextInput
          label={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>住所</span>
              <TooltipHelpButton
                tip="所在地を入力してください（建物名等も可）"
                size={18}
              />
            </div>
          }
          {...form.getInputProps('address')}
        />
        <TextInput
          label={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>電話番号</span>
              <TooltipHelpButton
                tip="市外局番からの電話番号を入力してください（ハイフン可）"
                size={18}
              />
            </div>
          }
          {...form.getInputProps('phone')}
        />
        <TextInput
          label={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>メール</span>
              <TooltipHelpButton
                tip="顧問先の代表メールアドレスを入力してください"
                size={18}
              />
            </div>
          }
          {...form.getInputProps('email')}
        />
        <Textarea
          label={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>備考</span>
              <TooltipHelpButton
                tip="補足情報や注意点を自由に記入してください"
                size={18}
              />
            </div>
          }
          {...form.getInputProps('note')}
          minRows={4}
        />

        <Group position="apart" mt="auto">
          <Button variant="default" onClick={onClose}>
            キャンセル
          </Button>
          <Button type="submit" loading={isPending}>
            保存
          </Button>
        </Group>
      </form>
    );
  };

  return (
    // ダッシュボードのテンプレート
    <DashboardLayout
      title={headerTitle}
      label={headerLabel}
      filterArea={filterAreaNode}
      actionButton={
        <Group style={{ justifyContent: 'flex-start' }}>
          <Button size="sm" onClick={() => openOnboarding('顧問先')}>
            パターン１
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              try {
                // lazy import controller to avoid circular issues
                const {
                  openProductTour,
                } = require('@/common/components/ProductTour/controller');
                openProductTour('顧問先');
              } catch (e) {
                // fallback: dispatch event directly
                window.dispatchEvent(
                  new CustomEvent('openProductTour', {
                    detail: { page: '顧問先' },
                  }),
                );
              }
            }}
          >
            パターン３
          </Button>
        </Group>
      }
    >
      {isLoading ? (
        <LoadingOverlay visible={isLoading} zIndex={1000} />
      ) : isError ? (
        <Text>顧問先一覧の取得に失敗しました</Text>
      ) : formMode === 'edit' && selectedClient ? (
        // 編集はモーダルではなくメイン表示領域で、ヘッダー＋タブ構成の詳細編集画面を表示
        <Box
          style={{
            height: '100%',
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            overflow: 'auto',
          }}
        >
          {/* 上部タイトル領域 */}
          <Paper
            withBorder
            radius={0}
            p="md"
            style={{ background: '#eef6ff', borderRadius: 6 }}
          >
            <Flex align="center" justify="space-between">
              <Group align="center" spacing="sm">
                <ActionIcon
                  variant="transparent"
                  size="lg"
                  onClick={() => {
                    setFormMode(null);
                    setSelectedClient(null);
                  }}
                >
                  {/* 戻る */}
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M15 18l-6-6 6-6"
                      stroke="#2c6fb5"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </ActionIcon>
                <div>
                  <Title order={3} style={{ margin: 0 }}>
                    {selectedClient.name}
                  </Title>
                  <Text size="sm" c="dimmed">
                    事業形態 {(selectedClient as any).businessType ?? '法人'}
                    　決算 {(selectedClient as any).fiscalMonth ?? '12月'}
                    　連携開始日 {(selectedClient as any).joinedAt ?? ''}
                  </Text>
                </div>
              </Group>

              <Group>
                <Button leftIcon={<IconPencil size={16} />} variant="default">
                  編集
                </Button>
              </Group>
            </Flex>
          </Paper>

          {/* タブと内容：テーブル単位で分ける */}
          <form
            onSubmit={editForm.onSubmit((values) => {
              if (!selectedClient) return;
              updateClient(
                { clientId: selectedClient.id, payload: values },
                {
                  onSuccess: () => {
                    setFormMode(null);
                    setSelectedClient(null);
                  },
                },
              );
            })}
            style={{
              flex: 1,
              minHeight: 0,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'auto',
            }}
          >
            <Tabs
              defaultValue="clients"
              styles={{
                root: {
                  flex: 1,
                  minHeight: 0,
                  display: 'flex',
                  flexDirection: 'column',
                },
              }}
            >
              <Tabs.List>
                <Tabs.Tab value="clients">顧問先</Tabs.Tab>
                <Tabs.Tab value="client_profiles">顧問先情報</Tabs.Tab>
                <Tabs.Tab value="client_contacts">連絡先</Tabs.Tab>
                <Tabs.Tab value="client_engagements">顧問先契約</Tabs.Tab>
                <Tabs.Tab value="owner_profiles">経営者プロファイル</Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel
                value="clients"
                pt="md"
                style={{ overflow: 'auto', flex: 1, minHeight: 0 }}
              >
                <Paper withBorder radius="md" p="md">
                  <Text weight={700}>顧問先マスタ</Text>
                  <Grid mt="sm">
                    <Grid.Col span={6}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                        }}
                      >
                        <Text size="sm" c="dimmed">
                          顧問先名
                        </Text>
                        <TooltipHelpButton
                          tip="顧問先の正式名称を入力してください"
                          size={14}
                        />
                      </div>
                      <TextInput {...editForm.getInputProps('name')} />
                    </Grid.Col>
                    <Grid.Col span={6}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                        }}
                      >
                        <Text size="sm" c="dimmed">
                          作成日時
                        </Text>
                        <TooltipHelpButton
                          tip="この顧問先が作成された日時（参照のみ）"
                          size={14}
                        />
                      </div>
                      <TextInput
                        value={(selectedClient as any)?.created_at ?? ''}
                        readOnly
                      />
                    </Grid.Col>
                    <Grid.Col span={6}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                        }}
                      >
                        <Text size="sm" c="dimmed">
                          更新日時
                        </Text>
                        <TooltipHelpButton
                          tip="この顧問先が最後に更新された日時（参照のみ）"
                          size={14}
                        />
                      </div>
                      <TextInput
                        value={(selectedClient as any)?.updated_at ?? ''}
                        readOnly
                      />
                    </Grid.Col>
                  </Grid>
                </Paper>
              </Tabs.Panel>

              <Tabs.Panel
                value="client_profiles"
                pt="md"
                style={{
                  overflow: 'auto',
                  flex: 1,
                  minHeight: 0,
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <Paper
                  withBorder
                  radius="md"
                  p="md"
                  style={{ flex: 1, overflow: 'auto', paddingBottom: 32 }}
                >
                  <Text weight={700}>顧問先情報</Text>
                  <Grid mt="sm">
                    <Grid.Col span={6}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                        }}
                      >
                        <Text size="sm" c="dimmed">
                          設立日
                        </Text>
                        <TooltipHelpButton
                          tip="設立年月日を入力してください"
                          size={14}
                        />
                      </div>
                      <TextInput {...editForm.getInputProps('established')} />
                    </Grid.Col>
                    <Grid.Col span={6}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                        }}
                      >
                        <Text size="sm" c="dimmed">
                          事業形態
                        </Text>
                        <TooltipHelpButton
                          tip="法人／個人など事業形態を入力してください"
                          size={14}
                        />
                      </div>
                      <TextInput {...editForm.getInputProps('client_type')} />
                    </Grid.Col>
                    <Grid.Col span={6}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                        }}
                      >
                        <Text size="sm" c="dimmed">
                          業種区分(大)
                        </Text>
                        <TooltipHelpButton
                          tip="大分類の業種コードや名称を入力してください"
                          size={14}
                        />
                      </div>
                      <TextInput
                        {...editForm.getInputProps('industry_category_major')}
                      />
                    </Grid.Col>
                    <Grid.Col span={6}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                        }}
                      >
                        <Text size="sm" c="dimmed">
                          業種区分(小)
                        </Text>
                        <TooltipHelpButton
                          tip="小分類の業種コードや名称を入力してください"
                          size={14}
                        />
                      </div>
                      <TextInput
                        {...editForm.getInputProps('industry_category_minor')}
                      />
                    </Grid.Col>
                    <Grid.Col span={6}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                        }}
                      >
                        <Text size="sm" c="dimmed">
                          法人番号
                        </Text>
                        <TooltipHelpButton
                          tip="法人番号（会社番号）を入力してください"
                          size={14}
                        />
                      </div>
                      <TextInput {...editForm.getInputProps('corporate_num')} />
                    </Grid.Col>
                    <Grid.Col span={6}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                        }}
                      >
                        <Text size="sm" c="dimmed">
                          インボイス登録番号
                        </Text>
                        <TooltipHelpButton
                          tip="インボイス制度の登録番号を入力してください（未登録の場合は空欄可）"
                          size={14}
                        />
                      </div>
                      <TextInput {...editForm.getInputProps('invoice_num')} />
                    </Grid.Col>
                    <Grid.Col span={6}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                        }}
                      >
                        <Text size="sm" c="dimmed">
                          決算日
                        </Text>
                        <TooltipHelpButton
                          tip="決算日の月/日を入力してください（例: 12-31）"
                          size={14}
                        />
                      </div>
                      <TextInput
                        {...editForm.getInputProps('fiscal_end_day')}
                      />
                    </Grid.Col>
                    <Grid.Col span={12}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                        }}
                      >
                        <Text size="sm" c="dimmed">
                          住所
                        </Text>
                        <TooltipHelpButton
                          tip="所在地（郵便番号・建物名含む）を入力してください"
                          size={14}
                        />
                      </div>
                      <TextInput {...editForm.getInputProps('address')} />
                    </Grid.Col>
                    <Grid.Col span={6}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                        }}
                      >
                        <Text size="sm" c="dimmed">
                          所轄税務署コード
                        </Text>
                        <TooltipHelpButton
                          tip="所轄の税務署コードを入力してください（わからない場合は空欄可）"
                          size={14}
                        />
                      </div>
                      <TextInput
                        {...editForm.getInputProps('tax_office_code')}
                      />
                    </Grid.Col>
                    <Grid.Col span={6}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                        }}
                      >
                        <Text size="sm" c="dimmed">
                          所轄税務署名
                        </Text>
                        <TooltipHelpButton
                          tip="所轄税務署の名称を入力してください"
                          size={14}
                        />
                      </div>
                      <TextInput
                        {...editForm.getInputProps('tax_office_name')}
                      />
                    </Grid.Col>
                    <Grid.Col span={12}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                        }}
                      >
                        <Text size="sm" c="dimmed">
                          備考
                        </Text>
                        <TooltipHelpButton
                          tip="補足情報や内部メモを記載してください"
                          size={14}
                        />
                      </div>
                      <Textarea
                        {...editForm.getInputProps('note')}
                        minRows={3}
                      />
                    </Grid.Col>
                  </Grid>
                </Paper>
              </Tabs.Panel>

              <Tabs.Panel
                value="client_contacts"
                pt="md"
                style={{
                  overflow: 'auto',
                  flex: 1,
                  minHeight: 0,
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <Paper
                  withBorder
                  radius="md"
                  p="md"
                  style={{ flex: 1, overflow: 'auto' }}
                >
                  <Text weight={700}>連絡先</Text>
                  <Box mt="sm">
                    {((editForm.values.contacts ?? []) as any[]).map(
                      (c, idx) => (
                        <Paper key={idx} withBorder radius="sm" p="sm" mb="sm">
                          <Grid>
                            <Grid.Col span={6}>
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 8,
                                }}
                              >
                                <Text size="sm" c="dimmed">
                                  連絡先名称
                                </Text>
                                <TooltipHelpButton
                                  tip="連絡先の名称（部署名など）を入力してください"
                                  size={14}
                                />
                              </div>
                              <TextInput
                                value={c.name ?? ''}
                                onChange={(ev) =>
                                  setContactField(
                                    idx,
                                    'name',
                                    ev.currentTarget.value,
                                  )
                                }
                              />
                            </Grid.Col>
                            <Grid.Col span={6}>
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 8,
                                }}
                              >
                                <Text size="sm" c="dimmed">
                                  担当者名
                                </Text>
                                <TooltipHelpButton
                                  tip="その連絡先の担当者名を入力してください"
                                  size={14}
                                />
                              </div>
                              <TextInput
                                value={c.manager_name ?? ''}
                                onChange={(ev) =>
                                  setContactField(
                                    idx,
                                    'manager_name',
                                    ev.currentTarget.value,
                                  )
                                }
                              />
                            </Grid.Col>
                            <Grid.Col span={6}>
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 8,
                                }}
                              >
                                <Text size="sm" c="dimmed">
                                  電話番号
                                </Text>
                                <TooltipHelpButton
                                  tip="連絡先の電話番号を入力してください（ハイフン可）"
                                  size={14}
                                />
                              </div>
                              <TextInput
                                value={c.phone_num ?? ''}
                                onChange={(ev) =>
                                  setContactField(
                                    idx,
                                    'phone_num',
                                    ev.currentTarget.value,
                                  )
                                }
                              />
                            </Grid.Col>
                            <Grid.Col span={6}>
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 8,
                                }}
                              >
                                <Text size="sm" c="dimmed">
                                  メールアドレス
                                </Text>
                                <TooltipHelpButton
                                  tip="連絡先のメールアドレスを入力してください"
                                  size={14}
                                />
                              </div>
                              <TextInput
                                value={c.mail_address ?? ''}
                                onChange={(ev) =>
                                  setContactField(
                                    idx,
                                    'mail_address',
                                    ev.currentTarget.value,
                                  )
                                }
                              />
                            </Grid.Col>
                            <Grid.Col span={6}>
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 8,
                                }}
                              >
                                <Text size="sm" c="dimmed">
                                  FAX
                                </Text>
                                <TooltipHelpButton
                                  tip="FAX番号を入力してください（ない場合は空欄可）"
                                  size={14}
                                />
                              </div>
                              <TextInput
                                value={c.fax_num ?? ''}
                                onChange={(ev) =>
                                  setContactField(
                                    idx,
                                    'fax_num',
                                    ev.currentTarget.value,
                                  )
                                }
                              />
                            </Grid.Col>
                          </Grid>
                        </Paper>
                      ),
                    )}
                    <Group position="right">
                      <Button variant="default" onClick={addContact}>
                        連絡先を追加
                      </Button>
                    </Group>
                  </Box>
                </Paper>
              </Tabs.Panel>

              <Tabs.Panel
                value="client_engagements"
                pt="md"
                style={{
                  overflow: 'auto',
                  flex: 1,
                  minHeight: 0,
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <Paper
                  withBorder
                  radius="md"
                  p="md"
                  style={{ flex: 1, overflow: 'auto' }}
                >
                  <Text weight={700}>顧問先契約</Text>
                  <Box mt="sm">
                    {((editForm.values.engagements ?? []) as any[]).map(
                      (e, idx) => (
                        <Paper key={idx} withBorder radius="sm" p="sm" mb="sm">
                          <Grid>
                            <Grid.Col span={6}>
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 8,
                                }}
                              >
                                <Text size="sm" c="dimmed">
                                  巡回監査連絡時期
                                </Text>
                                <TooltipHelpButton
                                  tip="巡回監査の連絡を行う時期（例：毎月/四半期）を入力してください"
                                  size={14}
                                />
                              </div>
                              <TextInput
                                value={e.contact_timing ?? ''}
                                onChange={(ev) =>
                                  setEngagementField(
                                    idx,
                                    'contact_timing',
                                    ev.currentTarget.value,
                                  )
                                }
                              />
                            </Grid.Col>
                            <Grid.Col span={6}>
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 8,
                                }}
                              >
                                <Text size="sm" c="dimmed">
                                  契約状況
                                </Text>
                                <TooltipHelpButton
                                  tip="現在の契約状況（継続/停止など）を入力してください"
                                  size={14}
                                />
                              </div>
                              <TextInput
                                value={e.status ?? ''}
                                onChange={(ev) =>
                                  setEngagementField(
                                    idx,
                                    'status',
                                    ev.currentTarget.value,
                                  )
                                }
                              />
                            </Grid.Col>
                            <Grid.Col span={6}>
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 8,
                                }}
                              >
                                <Text size="sm" c="dimmed">
                                  顧問開始日
                                </Text>
                                <TooltipHelpButton
                                  tip="顧問契約が開始した日を入力してください"
                                  size={14}
                                />
                              </div>
                              <TextInput
                                type="date"
                                value={e.advisor_start_date ?? ''}
                                onChange={(ev) =>
                                  setEngagementField(
                                    idx,
                                    'advisor_start_date',
                                    ev.currentTarget.value,
                                  )
                                }
                              />
                            </Grid.Col>
                            <Grid.Col span={6}>
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 8,
                                }}
                              >
                                <Text size="sm" c="dimmed">
                                  顧問終了日
                                </Text>
                                <TooltipHelpButton
                                  tip="顧問契約が終了する日（未定の場合は空欄可）を入力してください"
                                  size={14}
                                />
                              </div>
                              <TextInput
                                type="date"
                                value={e.advisor_end_date ?? ''}
                                onChange={(ev) =>
                                  setEngagementField(
                                    idx,
                                    'advisor_end_date',
                                    ev.currentTarget.value,
                                  )
                                }
                              />
                            </Grid.Col>
                          </Grid>
                        </Paper>
                      ),
                    )}
                    <Group position="right">
                      <Button
                        variant="default"
                        onClick={() => {
                          const arr = [
                            ...(editForm.values.engagements ?? []),
                            {
                              contact_timing: '',
                              status: '',
                              advisor_start_date: '',
                              advisor_end_date: '',
                            },
                          ];
                          editForm.setValues({
                            ...editForm.values,
                            engagements: arr,
                          });
                        }}
                      >
                        契約を追加
                      </Button>
                    </Group>
                  </Box>
                </Paper>
              </Tabs.Panel>

              <Tabs.Panel
                value="owner_profiles"
                pt="md"
                style={{
                  overflow: 'auto',
                  flex: 1,
                  minHeight: 0,
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <Paper
                  withBorder
                  radius="md"
                  p="md"
                  style={{ flex: 1, overflow: 'auto' }}
                >
                  <Text weight={700}>経営者プロファイル</Text>
                  <Box mt="sm">
                    {((editForm.values.owners ?? []) as any[]).map((o, idx) => (
                      <Paper key={idx} withBorder radius="sm" p="sm" mb="sm">
                        <Grid>
                          <Grid.Col span={6}>
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                              }}
                            >
                              <Text size="sm" c="dimmed">
                                名前
                              </Text>
                              <TooltipHelpButton
                                tip="経営者の氏名を入力してください"
                                size={14}
                              />
                            </div>
                            <TextInput
                              value={o.name ?? ''}
                              onChange={(ev) =>
                                setOwnerField(
                                  idx,
                                  'name',
                                  ev.currentTarget.value,
                                )
                              }
                            />
                          </Grid.Col>
                          <Grid.Col span={6}>
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                              }}
                            >
                              <Text size="sm" c="dimmed">
                                住所
                              </Text>
                              <TooltipHelpButton
                                tip="経営者の住所を入力してください（任意）"
                                size={14}
                              />
                            </div>
                            <TextInput
                              value={o.address ?? ''}
                              onChange={(ev) =>
                                setOwnerField(
                                  idx,
                                  'address',
                                  ev.currentTarget.value,
                                )
                              }
                            />
                          </Grid.Col>
                          <Grid.Col span={6}>
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                              }}
                            >
                              <Text size="sm" c="dimmed">
                                電話番号
                              </Text>
                              <TooltipHelpButton
                                tip="経営者の連絡先電話番号を入力してください"
                                size={14}
                              />
                            </div>
                            <TextInput
                              value={o.phone_num ?? ''}
                              onChange={(ev) =>
                                setOwnerField(
                                  idx,
                                  'phone_num',
                                  ev.currentTarget.value,
                                )
                              }
                            />
                          </Grid.Col>
                          <Grid.Col span={6}>
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                              }}
                            >
                              <Text size="sm" c="dimmed">
                                メールアドレス
                              </Text>
                              <TooltipHelpButton
                                tip="経営者のメールアドレスを入力してください（任意）"
                                size={14}
                              />
                            </div>
                            <TextInput
                              value={o.mail_address ?? ''}
                              onChange={(ev) =>
                                setOwnerField(
                                  idx,
                                  'mail_address',
                                  ev.currentTarget.value,
                                )
                              }
                            />
                          </Grid.Col>
                          <Grid.Col span={12}>
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                              }}
                            >
                              <Text size="sm" c="dimmed">
                                経営方針
                              </Text>
                              <TooltipHelpButton
                                tip="経営方針やビジョンなどの概要を記載してください"
                                size={14}
                              />
                            </div>
                            <Textarea
                              value={o.management_policy ?? ''}
                              onChange={(ev) =>
                                setOwnerField(
                                  idx,
                                  'management_policy',
                                  ev.currentTarget.value,
                                )
                              }
                              minRows={3}
                            />
                          </Grid.Col>
                        </Grid>
                      </Paper>
                    ))}
                    <Group position="right">
                      <Button
                        variant="default"
                        onClick={() => {
                          const arr = [
                            ...(editForm.values.owners ?? []),
                            {
                              name: '',
                              address: '',
                              phone_num: '',
                              mail_address: '',
                              management_policy: '',
                              tax_policy: '',
                              family_structure: '',
                              has_successor: false,
                              hobbies: '',
                            },
                          ];
                          editForm.setValues({
                            ...editForm.values,
                            owners: arr,
                          });
                        }}
                      >
                        担当者を追加
                      </Button>
                    </Group>
                  </Box>
                </Paper>
              </Tabs.Panel>
            </Tabs>
            <Group position="right" mt="md">
              <Button
                variant="default"
                onClick={() => {
                  setFormMode(null);
                  setSelectedClient(null);
                }}
              >
                キャンセル
              </Button>
              <Button type="submit">保存</Button>
            </Group>
          </form>
        </Box>
      ) : (
        <List
          columns={columns}
          data={filteredClients ?? []} // クライアント一覧を List に渡す
        />
      )}

      {/* 顧問先登録・編集モーダル */}
      <DashboardModal
        opened={isFormModalOpened}
        onClose={() => setFormMode(null)}
        title={formMode === 'create' ? '顧問先登録' : '顧問先編集'}
      >
        <ClientForm
          mode={formMode}
          defaultValues={
            formMode === 'edit' ? (selectedClient ?? undefined) : undefined
          }
          onClose={() => setFormMode(null)}
        />
      </DashboardModal>

      {/* 削除確認モーダル */}
      <DeleteModal
        opened={deleteModalOpend}
        title="顧問先を削除しますか？"
        message={
          selectedClient
            ? `「${selectedClient.name}」を削除すると、顧問先に紐づくすべてのデータが削除されます。`
            : ''
        }
        onCancel={() => setDeleteModalOpend(false)}
        onConfirm={() => {
          if (selectedClient) deleteClient(selectedClient.id);
          setDeleteModalOpend(false);
        }}
      />
    </DashboardLayout>
  );
};
