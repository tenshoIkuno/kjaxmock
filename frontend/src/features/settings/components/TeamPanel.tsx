import { useRef, useState } from 'react';
import {
  Avatar,
  Button,
  Group,
  Modal,
  Paper,
  Stack,
  Table,
  Text,
  Textarea,
  TextInput,
  MultiSelect,
  Center,
  Menu,
  ActionIcon,
} from '@mantine/core';
import {
  IconPlus,
  IconX,
  IconDotsVertical,
  IconEdit,
  IconTrash,
} from '@tabler/icons-react';
import { useForm } from '@mantine/form';
import { useAuthStore } from '@/features/auth/store/authStore';

type Team = {
  id: number;
  name: string;
  description?: string;
  members: string[];
};

export const TeamPanel = () => {
  const user = useAuthStore((s) => s.user);
  const defaultMember = user?.name ? user.name : '天勝';

  const [opened, setOpened] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);
  const [editing, setEditing] = useState<Team | null>(null);
  const idRef = useRef(1);

  const form = useForm({
    initialValues: {
      name: '',
      description: '',
      members: [defaultMember],
    },
    validate: {
      name: (v) => (!v || v.trim().length === 0 ? '必須です' : null),
    },
  });

  const handleOpen = () => {
    setEditing(null);
    form.reset();
    form.setFieldValue('members', [defaultMember]);
    setOpened(true);
  };

  const handleSubmit = (values: typeof form.values) => {
    if (editing) {
      // update
      setTeams((s) =>
        s.map((t) =>
          t.id === editing.id
            ? {
                ...t,
                name: values.name.trim(),
                description: values.description?.trim() || '',
                members: values.members,
              }
            : t,
        ),
      );
      setEditing(null);
      setOpened(false);
      return;
    }

    const team: Team = {
      id: idRef.current++,
      name: values.name.trim(),
      description: values.description?.trim() || '',
      members: values.members,
    };
    // 新しいチームは先頭に追加
    setTeams((s) => [team, ...s]);
    setOpened(false);
  };

  const handleEdit = (t: Team) => {
    setEditing(t);
    form.setValues({
      name: t.name,
      description: t.description ?? '',
      members: t.members,
    });
    setOpened(true);
  };

  const handleDelete = (id: number) => {
    if (!window.confirm('このチームを削除してよろしいですか？')) return;
    setTeams((s) => s.filter((x) => x.id !== id));
  };

  return (
    <div>
      <Group position="apart" style={{ marginBottom: 16 }}>
        <Text fw={600}>チーム管理</Text>
        <Button
          size="sm"
          leftIcon={<IconPlus />}
          onClick={handleOpen}
          id="team-create-button"
        >
          チーム作成
        </Button>
      </Group>

      {teams.length === 0 ? (
        <Paper withBorder radius="sm" p="xl" style={{ minHeight: 360 }}>
          <Center style={{ height: '100%' }}>
            <Text color="dimmed">チームが作成されていません</Text>
          </Center>
        </Paper>
      ) : (
        <Table striped highlightOnHover>
          <thead>
            <tr>
              <th>チーム名</th>
              <th>説明</th>
              <th>ユーザ</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {teams.map((t, idx) => (
              <tr
                key={t.id}
                id={idx === 0 ? 'team-first-row' : `team-row-${t.id}`}
              >
                <td>{t.name}</td>
                <td>{t.description}</td>
                <td>
                  {t.members.length > 0 ? (
                    <Group spacing={8}>
                      <Avatar radius="xl" size={24}>
                        {String(t.members[0])[0] ?? ''}
                      </Avatar>
                    </Group>
                  ) : (
                    <Text color="dimmed">-</Text>
                  )}
                </td>
                <td style={{ textAlign: 'right' }}>
                  <Menu withinPortal>
                    <Menu.Target>
                      <ActionIcon
                        aria-label="操作"
                        id={`team-row-${t.id}-menu`}
                      >
                        <IconDotsVertical />
                      </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Item
                        icon={<IconEdit size={14} />}
                        onClick={() => handleEdit(t)}
                      >
                        編集
                      </Menu.Item>
                      <Menu.Item
                        color="red"
                        icon={<IconTrash size={14} />}
                        onClick={() => handleDelete(t.id)}
                      >
                        削除
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title="チーム登録"
        withCloseButton={true}
        size="lg"
        closeOnClickOutside={false}
      >
        <form id="team-create-area" onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <TextInput
              label="チーム名"
              required
              placeholder="チーム名を入力"
              {...form.getInputProps('name')}
              id="team-name-input"
            />

            <Textarea
              label="説明"
              placeholder="説明を入力"
              autosize
              minRows={3}
              {...form.getInputProps('description')}
            />

            <div>
              <Text size="sm" fw={500} mb={8}>
                メンバー
              </Text>
              <Text size="xs" color="dimmed" mb={8}>
                メンバーは後から追加もできます
              </Text>
              <MultiSelect
                data={[]}
                placeholder="ユーザーを追加"
                creatable
                searchable
                getCreateLabel={(query) => `+ ${query}`}
                onCreate={(query) => query}
                {...form.getInputProps('members')}
              />
            </div>

            <Group position="right" mt="md">
              <Button variant="outline" onClick={() => setOpened(false)}>
                キャンセル
              </Button>
              <Button
                type="submit"
                id="team-submit-button"
                disabled={
                  !form.values.name || form.values.name.trim().length === 0
                }
              >
                登録
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </div>
  );
};

export default TeamPanel;
