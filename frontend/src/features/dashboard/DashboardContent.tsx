import React from 'react';
import {
  Grid,
  Card,
  Text,
  Title,
  Badge,
  Group,
  Stack,
  RingProgress,
  Progress,
  Paper,
  Button,
  Divider,
  SimpleGrid,
  ScrollArea,
  Center,
  Table,
  Select,
  Skeleton,
  ActionIcon,
} from '@mantine/core';
import { openOnboarding } from '@/common/components/Onboarding/controller';
import { openProductTour } from '@/common/components/ProductTour/controller';
import { useNotifications } from '@/features/notifications/hooks/useNotifications';
import { useAuthStore } from '@/features/auth/store/authStore';
import { useEffect, useState } from 'react';
import {
  getTableRecords,
  setTableRecords,
  addTableRecords,
} from './inMemoryTable';
import {
  IconChartBar,
  IconBolt,
  IconClock,
  IconCheck,
  IconMicrophone,
  IconSearch,
  IconUsers,
  IconAlertTriangle,
  IconEdit,
  IconTrash,
} from '@tabler/icons-react';

export function DashboardContent() {
  const [records, setRecords] = useState(() => getTableRecords());
  const [loading, setLoading] = useState(true);
  const [showNumber, setShowNumber] = useState(false);
  // when loading finishes, trigger fade-in for the numeric label
  useEffect(() => {
    if (!loading) {
      setShowNumber(false);
      const t = setTimeout(() => setShowNumber(true), 60);
      return () => clearTimeout(t);
    }
    setShowNumber(false);
  }, [loading]);

  // Animated concentric rings component (simple CSS-in-JSX)
  const AnimatedRings: React.FC<{ size?: number }> = ({ size = 160 }) => {
    const ringStyle = (i: number) => ({
      position: 'absolute' as const,
      width: size - i * 28,
      height: size - i * 28,
      borderRadius: '50%',
      border: `4px solid rgba(100,120,240,${0.12 + i * 0.12})`,
      boxSizing: 'border-box' as const,
      top: (size - (size - i * 28)) / 2,
      left: (size - (size - i * 28)) / 2,
      animation: `pulse-${i} 1400ms ${i * 160}ms infinite ease-in-out`,
    });

    return (
      <div style={{ width: size, height: size, position: 'relative' }}>
        <style>{`
          @keyframes pulse-0 { 0% { transform: scale(.9); opacity: .18 } 50% { transform: scale(1.06); opacity: .36 } 100% { transform: scale(.9); opacity: .18 } }
          @keyframes pulse-1 { 0% { transform: scale(.92); opacity: .14 } 50% { transform: scale(1.02); opacity: .28 } 100% { transform: scale(.92); opacity: .14 } }
          @keyframes pulse-2 { 0% { transform: scale(.94); opacity: .1 } 50% { transform: scale(1.0); opacity: .22 } 100% { transform: scale(.94); opacity: .1 } }
        `}</style>
        <div style={ringStyle(2)} />
        <div style={ringStyle(1)} />
        <div style={ringStyle(0)} />
      </div>
    );
  };

  useEffect(() => {
    // load plain JSON table from public folder (optional). If present, replace in-memory table.
    const LOADING_MIN_MS = 400;
    const start = Date.now();
    fetch('/dashboard-records.json')
      .then((r) => {
        if (!r.ok) throw new Error('fetch failed');
        return r.json();
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          // ensure every record has a tenant_id to keep scoping consistent
          const normalized = data.map((r: any) => ({
            ...(r || {}),
            tenant_id: r?.tenant_id ?? 'tenant-1',
          }));
          setTableRecords(normalized);
          setRecords(getTableRecords());
        }
      })
      .catch(() => {
        // keep in-memory table (fallback)
        setRecords(getTableRecords());
      })
      .finally(() => {
        const elapsed = Date.now() - start;
        const wait = Math.max(0, LOADING_MIN_MS - elapsed);
        setTimeout(() => setLoading(false), wait);
      });
  }, []);

  const user = useAuthStore((s) => s.user);
  // scope records to the current user's tenant (組織)
  // If user has no tenant_id (local dev) fallback to the first record's tenant_id
  const tenantId =
    user?.tenant_id ??
    (records && records.length > 0
      ? (records[0] as any).tenant_id
      : 'tenant-1');
  const scopedRecords = records.filter((r: any) => r.tenant_id === tenantId);

  const statusCounts = {
    未着手: scopedRecords.filter((c) => c.ステータス === '未承認').length,
    作業中: scopedRecords.filter((c) => c.ステータス === '作成中').length,
    確認待ち: scopedRecords.filter((c) => c.ステータス === '承認待ち').length,
    完了: scopedRecords.filter((c) => c.ステータス === '承認済み').length,
  } as const;

  const totalCases = scopedRecords.length;
  const completionRate =
    totalCases > 0 ? Math.round((statusCounts.完了 / totalCases) * 100) : 0;

  const recentCases = scopedRecords.slice(0, 5);

  const role = user?.role ?? '担当職員';
  const name = user?.name ?? '';

  const importantIssues = scopedRecords
    .filter((r) => r.てん末 && r.てん末.length > 40)
    .slice(0, 5);

  // team aggregation by staff
  const teamSummary = scopedRecords.reduce(
    (acc, r) => {
      const k = r.担当職員_氏名 || '未割当';
      acc[k] = (acc[k] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const teamTotal = Object.values(teamSummary).reduce((a, b) => a + b, 0);

  // overdue = 処理年月日 が 30 日以上前で承認済みでないもの
  const overdueRecords = scopedRecords.filter((r) => {
    try {
      const d = new Date(r.処理年月日);
      const days = (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24);
      return days >= 30 && r.ステータス !== '承認済み';
    } catch (e) {
      return false;
    }
  });

  const uniqueClients = Array.from(
    new Set(scopedRecords.map((r) => r.委嘱者名称)),
  );
  const uniqueStaff = Array.from(
    new Set(scopedRecords.map((r) => r.担当職員_氏名)),
  );

  // Escalation / AI analysis summaries
  const escalationRecords = scopedRecords.filter(
    (r) => r.escalation && !r.escalation.resolved,
  );
  const urgentEscalations = escalationRecords.filter(
    (r) => r.escalation?.urgent,
  );
  const escalationCounts = {
    total: escalationRecords.length,
    urgent: urgentEscalations.length,
  };

  const aiSummaries = scopedRecords
    .filter(
      (r) => r.ai_analysis && (r.ai_analysis.summary || r.ai_analysis.score),
    )
    .map((r) => ({
      id: r.id,
      summary: r.ai_analysis.summary ?? '',
      score: r.ai_analysis.score ?? 0,
    }));

  // selected staff for 担当職員 view (default: user's name if matches, otherwise first staff)
  const [selectedStaff, setSelectedStaff] = useState<string | null>(null);
  useEffect(() => {
    if (!selectedStaff) {
      const defaultStaff =
        uniqueStaff.find((s) => s === name) || uniqueStaff[0] || null;
      setSelectedStaff(defaultStaff);
    }
  }, [uniqueStaff, name, selectedStaff]);

  // role-specific subsets that depend on selectedStaff
  const myCases = selectedStaff
    ? scopedRecords.filter((r) => r.担当職員_氏名 === selectedStaff)
    : [];
  const myStatusCounts = {
    未着手: myCases.filter((c) => c.ステータス === '未承認').length,
    作業中: myCases.filter((c) => c.ステータス === '作成中').length,
    確認待ち: myCases.filter((c) => c.ステータス === '承認待ち').length,
    完了: myCases.filter((c) => c.ステータス === '承認済み').length,
  } as const;

  // 表示用に件数が大きすぎる場合はサンプルサイズに縮小して表示する
  const scaleCounts = (counts: Record<string, number>, sampleSize = 6) => {
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    if (total === 0) return { ...counts };
    // 実データが小さい場合はそのまま返す
    if (total <= sampleSize) return { ...counts };
    // 比率に基づいてサンプルに落とし込む
    const keys = Object.keys(counts);
    const floats = keys.map((k) => ({
      k,
      v: ((counts as any)[k] / total) * sampleSize,
    }));
    const rounded: Record<string, number> = {} as any;
    let assigned = 0;
    floats.forEach((f) => {
      rounded[f.k] = Math.floor(f.v);
      assigned += rounded[f.k];
    });
    // 残りを比率の大きい順に配分
    let remain = sampleSize - assigned;
    floats.sort((a, b) => b.v - a.v);
    let idx = 0;
    while (remain > 0) {
      rounded[floats[idx % floats.length].k] =
        (rounded[floats[idx % floats.length].k] || 0) + 1;
      remain -= 1;
      idx += 1;
    }
    return rounded;
  };

  const displayedMyStatusCounts = scaleCounts(
    myStatusCounts,
    Math.min(8, Math.max(3, Math.round(myCases.length * 0.15)) || 3),
  );

  // If the current role is 担当職員 and they have no cases, synthesize a few mock cases
  // purely on the frontend so developer can see 'あなたの最近の案件' without a backend.
  useEffect(() => {
    if (role === '担当職員' && name && myCases.length === 0) {
      const now = Date.now();
      const synth: any[] = [
        {
          tenant_id: tenantId,
          id: `synth-${now}-1`,
          委嘱者名称: 'サンプル顧問先A',
          整理番号: `S-${new Date(now).getFullYear()}-A01`,
          ステータス: '作成中',
          業務区分: '巡回監査',
          内容_税目等: '売上',
          てん末: 'こちらはフロント内で生成されたサンプルの案件です。',
          担当職員_氏名: name,
          処理年月日: new Date(now - 1000 * 60 * 60 * 24 * 2).toISOString(),
        },
        {
          tenant_id: tenantId,
          id: `synth-${now}-2`,
          委嘱者名称: 'サンプル顧問先B',
          整理番号: `S-${new Date(now).getFullYear()}-B02`,
          ステータス: '承認待ち',
          業務区分: '申告書',
          内容_税目等: '消費税',
          てん末: '確認が必要な項目があります。',
          担当職員_氏名: name,
          処理年月日: new Date(now - 1000 * 60 * 60 * 24 * 10).toISOString(),
        },
        {
          tenant_id: tenantId,
          id: `synth-${now}-3`,
          委嘱者名称: 'サンプル顧問先C',
          整理番号: `S-${new Date(now).getFullYear()}-C03`,
          ステータス: '未承認',
          業務区分: '記帳代行',
          内容_税目等: '会計',
          てん末: '未送信の報告があります。',
          担当職員_氏名: name,
          処理年月日: new Date(now - 1000 * 60 * 60 * 24 * 35).toISOString(),
        },
      ];

      // persist synthesized records into the in-memory table (avoids duplication)
      addTableRecords(synth);
      setRecords(getTableRecords());
      // ensure a short display of loader so animation is visible
      setTimeout(() => setLoading(false), 120);
    }
    // only run when role/name/myCases change
  }, [role, name, myCases.length, setRecords]);

  // helper: map status to badge color
  const getStatusColor = (s: string) => {
    if (s === '承認済み') return 'green';
    if (s === '承認待ち') return 'orange';
    if (s === '作成中') return 'yellow';
    if (s === '未承認') return 'red';
    return 'gray';
  };

  const formatDate = (d: string | undefined) => {
    if (!d) return '-';
    try {
      return new Date(d).toLocaleDateString();
    } catch (e) {
      return d;
    }
  };

  // KPI fade on role change
  const [kpiOpacity, setKpiOpacity] = useState(1);
  useEffect(() => {
    // fade out then in
    setKpiOpacity(0);
    const t = setTimeout(() => setKpiOpacity(1), 80);
    return () => clearTimeout(t);
  }, [role]);

  return (
    <div>
      <Group justify="space-between" mb="xl">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Title order={2} mb="xs">
              ダッシュボード
            </Title>
            <Button
              size="xs"
              variant="outline"
              onClick={() => openOnboarding('ダッシュボード')}
            >
              パターン１
            </Button>
            <Button
              size="xs"
              variant="subtle"
              onClick={() => openProductTour('ダッシュボード')}
            >
              パターン３
            </Button>
          </div>
          <Text c="dimmed">
            ようこそ、{user?.name ?? 'ユーザー'}さん — ロール: {role}
          </Text>
        </div>
        <Paper
          withBorder
          radius="md"
          p="xs"
          style={{ minWidth: 170, textAlign: 'center' }}
        >
          <Text size="xs" c="dimmed" style={{ textTransform: 'capitalize' }}>
            {new Date().toLocaleDateString('ja-JP', { weekday: 'long' })}
          </Text>
          <Title order={4} style={{ marginTop: 4, lineHeight: 1.1 }}>
            {new Date().toLocaleDateString('ja-JP', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Title>
        </Paper>
      </Group>

      {/* Onboarding modal rendered globally in App; open via controller */}

      {/* KPI summary (role-specific) */}
      <div style={{ opacity: kpiOpacity, transition: 'opacity 220ms ease' }}>
        <SimpleGrid
          cols={3}
          spacing="md"
          mb="md"
          breakpoints={[
            { maxWidth: 'md', cols: 2 },
            { maxWidth: 'sm', cols: 1 },
          ]}
        >
          {
            // build role-specific KPI cards
            ((): JSX.Element[] => {
              const cards: Array<{
                title: string;
                value: React.ReactNode;
                subtitle?: string;
                icon?: any;
                color?: string;
              }> = [];
              if (role === '担当職員') {
                const myOverdue = myCases.filter((r) => {
                  try {
                    return (
                      (Date.now() - new Date(r.処理年月日).getTime()) /
                        (1000 * 60 * 60 * 24) >=
                        30 && r.ステータス !== '承認済み'
                    );
                  } catch {
                    return false;
                  }
                }).length;
                cards.push({
                  title: '自分の担当数',
                  value: myCases.length,
                  subtitle: '未送信報告',
                  icon: IconMicrophone,
                  color: 'blue',
                });
                cards.push({
                  title: '自分の期限超過',
                  value: myOverdue,
                  subtitle: '30日以上の未処理',
                  icon: IconClock,
                  color: 'red',
                });
                cards.push({
                  title: '重要指摘',
                  value: importantIssues.length,
                  subtitle: '自動抽出件数',
                  icon: IconAlertTriangle,
                  color: 'orange',
                });
              } else if (role === '担当税理士') {
                // チーム総数カードは削除。所長向けサマリ内に表示します。
                cards.push({
                  title: 'エスカレーション',
                  value: `${escalationCounts.urgent}/${escalationCounts.total}`,
                  subtitle: '緊急／未解決',
                  icon: IconAlertTriangle,
                  color: 'red',
                });
                cards.push({
                  title: '承認待ち',
                  value: statusCounts.確認待ち,
                  subtitle: '承認待ち件数',
                  icon: IconCheck,
                  color: 'orange',
                });
                cards.push({
                  title: '期限超過',
                  value: overdueRecords.length,
                  subtitle: '30日以上',
                  icon: IconClock,
                  color: 'red',
                });
                cards.push({
                  title: '顧問先数',
                  value: uniqueClients.length,
                  subtitle: '管理中顧問先',
                  icon: IconChartBar,
                  color: 'teal',
                });
              } else if (role === '上長') {
                cards.push({
                  title: '期限超過',
                  value: overdueRecords.length,
                  subtitle: '30日以上',
                  icon: IconClock,
                  color: 'red',
                });
                cards.push({
                  title: '緊急エスカレーション',
                  value: escalationCounts.urgent,
                  subtitle: '未解決（緊急）',
                  icon: IconAlertTriangle,
                  color: 'red',
                });
                cards.push({
                  title: 'チーム未処理',
                  value: statusCounts.作業中,
                  subtitle: '作業中件数',
                  icon: IconBolt,
                  color: 'yellow',
                });
                cards.push({
                  title: '担当者数',
                  value: uniqueStaff.length,
                  subtitle: 'チーム人数',
                  icon: IconUsers,
                  color: 'blue',
                });
              } else {
                // 管理者
                cards.push({
                  title: '総報告数',
                  value: totalCases,
                  subtitle: `顧問先: ${uniqueClients.length}社`,
                  icon: IconChartBar,
                  color: 'blue',
                });
                cards.push({
                  title: '承認済み',
                  value: statusCounts.完了,
                  subtitle: '承認済み件数',
                  icon: IconCheck,
                  color: 'green',
                });
                cards.push({
                  title: '承認待ち',
                  value: statusCounts.確認待ち,
                  subtitle: '承認待ち件数',
                  icon: IconClock,
                  color: 'orange',
                });
                cards.push({
                  title: '担当職員数',
                  value: uniqueStaff.length,
                  subtitle: '登録職員数',
                  icon: IconUsers,
                  color: 'teal',
                });
              }

              return cards.map((c, idx) => (
                <Card
                  key={idx}
                  withBorder
                  padding="md"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <Text size="xs" c="dimmed">
                      {c.title}
                    </Text>
                    <Group position="apart" align="center" mt="xs">
                      <Title order={3}>{c.value}</Title>
                      {c.icon ? <c.icon /> : null}
                    </Group>
                    {c.subtitle ? (
                      <Text size="xs" c="dimmed" mt="xs">
                        {c.subtitle}
                      </Text>
                    ) : null}
                  </div>
                </Card>
              ));
            })()
          }
        </SimpleGrid>
      </div>

      <Grid gutter="md">
        <Grid.Col span={{ base: 12, md: 7 }}>
          {/* Role-specific main panel */}
          {role === '担当職員' && (
            <>
              <Card shadow="sm" padding="lg" radius="md" withBorder mb="md">
                <Group position="apart">
                  <Title order={4}>あなたの本日のタスク</Title>
                  <Group>
                    <Button
                      leftSection={<IconMicrophone size={16} />}
                      variant="light"
                    >
                      録音開始
                    </Button>
                    <Button
                      leftSection={<IconSearch size={16} />}
                      variant="default"
                    >
                      報告作成
                    </Button>
                  </Group>
                </Group>
                <Divider my="sm" />
                <Group align="center" spacing="md">
                  <Text size="sm" c="dimmed">
                    未送信報告: {myCases.length} 件
                  </Text>
                  <div style={{ flex: 1 }} />
                  <Select
                    data={uniqueStaff.map((s) => ({ value: s, label: s }))}
                    value={selectedStaff ?? undefined}
                    onChange={(v) => setSelectedStaff(v ?? null)}
                    placeholder="表示する担当を選択"
                    size="sm"
                    style={{ width: 220 }}
                  />
                </Group>
              </Card>

              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Title order={5} mb="sm">
                  あなたの最近の案件
                </Title>
                <SimpleGrid cols={4} spacing="sm" mb="sm">
                  <Card withBorder padding="sm">
                    <Text size="xs" c="dimmed">
                      未着手
                    </Text>
                    <Title order={4}>
                      {displayedMyStatusCounts.未着手 ?? 0}
                    </Title>
                  </Card>
                  <Card withBorder padding="sm">
                    <Text size="xs" c="dimmed">
                      作業中
                    </Text>
                    <Title order={4}>
                      {displayedMyStatusCounts.作業中 ?? 0}
                    </Title>
                  </Card>
                  <Card withBorder padding="sm">
                    <Text size="xs" c="dimmed">
                      確認待ち
                    </Text>
                    <Title order={4}>
                      {displayedMyStatusCounts.確認待ち ?? 0}
                    </Title>
                  </Card>
                  <Card withBorder padding="sm">
                    <Text size="xs" c="dimmed">
                      完了
                    </Text>
                    <Title order={4}>{displayedMyStatusCounts.完了 ?? 0}</Title>
                  </Card>
                </SimpleGrid>

                {myCases.length ? (
                  <ScrollArea style={{ height: 300 }}>
                    <Table
                      verticalSpacing="sm"
                      style={{ minWidth: 720, tableLayout: 'fixed' }}
                    >
                      <colgroup>
                        <col style={{ width: '18%' }} />
                        <col style={{ width: '36%' }} />
                        <col style={{ width: '16%' }} />
                        <col style={{ width: '15%' }} />
                        <col style={{ width: '15%' }} />
                      </colgroup>
                      <thead>
                        <tr>
                          <th style={{ textAlign: 'left' }}>整理番号</th>
                          <th style={{ textAlign: 'left' }}>顧問先</th>
                          <th style={{ textAlign: 'left' }}>処理日</th>
                          <th style={{ textAlign: 'left' }}>ステータス</th>
                          <th
                            style={{
                              textAlign: 'right',
                              verticalAlign: 'middle',
                              paddingRight: 12,
                            }}
                          >
                            操作
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {myCases.map((r) => (
                          <tr key={r.id}>
                            <td
                              style={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              <Text size="sm">{r.整理番号}</Text>
                            </td>
                            <td
                              style={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              <Text size="sm">{r.委嘱者名称}</Text>
                            </td>
                            <td>
                              <Text size="sm">{formatDate(r.処理年月日)}</Text>
                            </td>
                            <td>
                              <Badge color={getStatusColor(r.ステータス)}>
                                {r.ステータス}
                              </Badge>
                            </td>
                            <td
                              style={{
                                display: 'flex',
                                justifyContent: 'flex-end',
                                alignItems: 'center',
                                paddingRight: 12,
                              }}
                            >
                              <Group spacing="xs">
                                <ActionIcon
                                  size="sm"
                                  variant="light"
                                  title="編集"
                                >
                                  <IconEdit size={16} />
                                </ActionIcon>
                                <ActionIcon
                                  size="sm"
                                  variant="light"
                                  color="red"
                                  title="削除"
                                >
                                  <IconTrash size={16} />
                                </ActionIcon>
                              </Group>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </ScrollArea>
                ) : (
                  <Text size="sm" c="dimmed">
                    担当の案件はありません
                  </Text>
                )}
              </Card>
            </>
          )}

          {role === '担当税理士' && (
            <>
              <Card shadow="sm" padding="lg" radius="md" withBorder mb="md">
                <Group position="apart">
                  <Title order={4}>所長向けサマリ</Title>
                  <Button leftSection={<IconUsers size={16} />} variant="light">
                    チーム一覧
                  </Button>
                </Group>
                <Divider my="sm" />
                <Group position="apart">
                  <Text size="sm">チーム総数</Text>
                  <Text size="sm" fw={600}>
                    {teamTotal} 件
                  </Text>
                </Group>
                <Text size="sm" c="dimmed">
                  未承認の報告: {statusCounts.未着手} 件
                </Text>
                <Text size="sm" c="dimmed">
                  承認待ち: {statusCounts.確認待ち} 件
                </Text>
                <Divider my="sm" />
                <Title order={6} mb="xs">
                  チーム別件数
                </Title>
                {/* build per-staff summary including overdue / important counts */}
                {(() => {
                  const perStaff = Object.keys(teamSummary).map((staff) => {
                    const total = teamSummary[staff] || 0;
                    const overdue = scopedRecords.filter(
                      (r) =>
                        r.担当職員_氏名 === staff &&
                        (Date.now() - new Date(r.処理年月日).getTime()) /
                          (1000 * 60 * 60 * 24) >=
                          30 &&
                        r.ステータス !== '承認済み',
                    ).length;
                    const important = scopedRecords.filter(
                      (r) =>
                        r.担当職員_氏名 === staff &&
                        r.てん末 &&
                        r.てん末.length > 40,
                    ).length;
                    return { staff, total, overdue, important };
                  });

                  return (
                    <ScrollArea style={{ height: 260 }}>
                      <Table
                        verticalSpacing="sm"
                        style={{ minWidth: 520, tableLayout: 'fixed' }}
                      >
                        <colgroup>
                          <col style={{ width: '50%' }} />
                          <col style={{ width: '18%' }} />
                          <col style={{ width: '16%' }} />
                          <col style={{ width: '16%' }} />
                        </colgroup>
                        <thead>
                          <tr>
                            <th style={{ textAlign: 'left' }}>担当職員</th>
                            <th style={{ textAlign: 'right' }}>件数</th>
                            <th style={{ textAlign: 'right' }}>期限超過</th>
                            <th style={{ textAlign: 'right' }}>重要指摘</th>
                          </tr>
                        </thead>
                        <tbody>
                          {perStaff.map((p) => (
                            <tr key={p.staff}>
                              <td
                                style={{
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                <Text size="sm">{p.staff}</Text>
                              </td>
                              <td style={{ textAlign: 'right' }}>
                                <Text size="sm" fw={700}>
                                  {p.total}
                                </Text>
                              </td>
                              <td style={{ textAlign: 'right' }}>
                                <Text
                                  size="sm"
                                  color={p.overdue ? 'red' : undefined}
                                >
                                  {p.overdue}
                                </Text>
                              </td>
                              <td style={{ textAlign: 'right' }}>
                                <Text size="sm">{p.important}</Text>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </ScrollArea>
                  );
                })()}
              </Card>

              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Title order={5}>重要な指摘（自動抽出）</Title>
                <ScrollArea style={{ height: 220 }}>
                  <Stack>
                    {importantIssues.map((r) => (
                      <Paper key={r.id} p="sm" withBorder>
                        <Text fw={600}>
                          {r.委嘱者名称} — {r.整理番号}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {r.てん末}
                        </Text>
                        <div style={{ marginTop: 8 }}>
                          <Badge color={getStatusColor(r.ステータス)}>
                            {r.ステータス}
                          </Badge>
                        </div>
                      </Paper>
                    ))}
                  </Stack>
                </ScrollArea>
              </Card>
              <Card shadow="sm" padding="lg" radius="md" withBorder mt="md">
                <Title order={5}>エスカレーション（未解決）</Title>
                <Text size="xs" c="dimmed" mb="xs">
                  緊急/未解決: {escalationCounts.urgent} /{' '}
                  {escalationCounts.total}
                </Text>
                <ScrollArea style={{ height: 220 }}>
                  <Stack>
                    {escalationRecords.slice(0, 6).map((r) => (
                      <Paper key={r.id} p="sm" withBorder>
                        <Group position="apart">
                          <div>
                            <Text fw={600}>
                              {r.委嘱者名称} — {r.整理番号}
                            </Text>
                            <Text size="xs" c="dimmed">
                              担当: {r.担当職員_氏名}
                            </Text>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            {r.escalation?.urgent ? (
                              <Badge color="red">緊急</Badge>
                            ) : (
                              <Badge color="orange">要対応</Badge>
                            )}
                            <div style={{ marginTop: 6 }}>
                              <Text size="xs" c="dimmed">
                                {formatDate(r.処理年月日)}
                              </Text>
                            </div>
                          </div>
                        </Group>
                        {r.escalation?.note ? (
                          <Text size="xs" c="dimmed" mt="6">
                            {r.escalation.note}
                          </Text>
                        ) : null}
                      </Paper>
                    ))}
                  </Stack>
                </ScrollArea>
              </Card>
            </>
          )}

          {role === '上長' && (
            <>
              <Card shadow="sm" padding="lg" radius="md" withBorder mb="md">
                <Group position="apart">
                  <Title order={4}>マネージャーサマリ</Title>
                  <Button
                    leftSection={<IconAlertTriangle size={16} />}
                    variant="light"
                  >
                    期限超過一覧
                  </Button>
                </Group>
                <Divider my="sm" />
                <Text size="sm" c="dimmed">
                  チームの未処理: {statusCounts.作業中} 件
                </Text>
                <Text size="sm" c="dimmed">
                  期限超過（30日以上）: {overdueRecords.length} 件
                </Text>
              </Card>

              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Title order={5}>レビュー待ちの報告</Title>
                <ScrollArea style={{ height: 240 }}>
                  <Stack>
                    {recentCases.map((r) => (
                      <Paper key={r.id} p="sm" withBorder>
                        <Group position="apart">
                          <div>
                            <Text fw={600}>{r.委嘱者名称}</Text>
                            <Text size="xs" c="dimmed">
                              担当: {r.担当職員_氏名}
                            </Text>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <Text size="xs" c="dimmed">
                              {formatDate(r.処理年月日)}
                            </Text>
                            <div style={{ marginTop: 6 }}>
                              <Badge color={getStatusColor(r.ステータス)}>
                                {r.ステータス}
                              </Badge>
                            </div>
                          </div>
                        </Group>
                      </Paper>
                    ))}
                  </Stack>
                </ScrollArea>
              </Card>
              <Card shadow="sm" padding="lg" radius="md" withBorder mt="md">
                <Title order={5}>期限超過一覧（抜粋）</Title>
                <Stack>
                  {overdueRecords.slice(0, 5).map((r) => (
                    <Paper key={r.id} p="sm" withBorder>
                      <Group position="apart">
                        <div>
                          <Text fw={600}>
                            {r.委嘱者名称} — {r.整理番号}
                          </Text>
                          <Text size="xs" c="dimmed">
                            担当: {r.担当職員_氏名}
                          </Text>
                        </div>
                        <Text size="xs" c="dimmed">
                          {new Date(r.処理年月日).toLocaleDateString()}
                        </Text>
                      </Group>
                    </Paper>
                  ))}
                </Stack>
              </Card>
              <Card shadow="sm" padding="lg" radius="md" withBorder mt="md">
                <Title order={5}>緊急エスカレーション（抜粋）</Title>
                <Text size="xs" c="dimmed" mb="xs">
                  未解決の緊急エスカレーション: {escalationCounts.urgent}件
                </Text>
                <Stack>
                  {urgentEscalations.slice(0, 5).map((r) => (
                    <Paper key={r.id} p="sm" withBorder>
                      <Group position="apart">
                        <div>
                          <Text fw={700}>
                            {r.委嘱者名称} — {r.整理番号}
                          </Text>
                          <Text size="xs" c="dimmed">
                            担当: {r.担当職員_氏名}
                          </Text>
                        </div>
                        <div>
                          <Badge color="red">緊急</Badge>
                          <Text size="xs" c="dimmed">
                            {formatDate(r.処理年月日)}
                          </Text>
                        </div>
                      </Group>
                      {r.escalation?.note ? (
                        <Text size="xs" c="dimmed" mt="6">
                          {r.escalation.note}
                        </Text>
                      ) : null}
                    </Paper>
                  ))}
                </Stack>
              </Card>
            </>
          )}

          {role === '管理者' && (
            <>
              <Card shadow="sm" padding="lg" radius="md" withBorder mb="md">
                <Group position="apart">
                  <Title order={4}>管理者パネル</Title>
                  <Button leftSection={<IconUsers size={16} />} variant="light">
                    ユーザー管理
                  </Button>
                </Group>
                <Divider my="sm" />
                <Text size="sm" c="dimmed">
                  システム統計
                </Text>
                <Group position="apart">
                  <Text size="sm">総報告数</Text>
                  <Text size="sm" fw={600}>
                    {totalCases}件
                  </Text>
                </Group>
                <Group position="apart">
                  <Text size="sm">顧問先数</Text>
                  <Text size="sm" fw={600}>
                    {uniqueClients.length}社
                  </Text>
                </Group>
                <Group position="apart">
                  <Text size="sm">担当職員数</Text>
                  <Text size="sm" fw={600}>
                    {uniqueStaff.length}名
                  </Text>
                </Group>
              </Card>
            </>
          )}
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 5 }}>
          <Stack gap="md">
            <Card shadow="sm" padding="lg" radius="md" withBorder mb="md">
              <Title order={4} mb="md">
                リスクアラート（通知）
              </Title>
              {/* show simple list of recent notifications */}
              {(() => {
                const { data: notifs, isLoading } = useNotifications();
                if (isLoading) return <Skeleton />;
                const items = (notifs ?? []).slice(0, 6);
                return (
                  <Stack>
                    {items.map((n) => (
                      <Paper
                        key={n.id}
                        p="xs"
                        withBorder
                        onClick={() =>
                          window.alert('通知詳細はヘッダーの通知から開けます')
                        }
                        style={{ cursor: 'pointer' }}
                      >
                        <Group position="apart">
                          <div>
                            <Text fw={600}>{n.title}</Text>
                            <Text size="xs" c="dimmed">
                              {n.summary}
                            </Text>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <Badge
                              color={
                                n.severity === 'critical'
                                  ? 'red'
                                  : n.severity === 'medium'
                                    ? 'orange'
                                    : 'gray'
                              }
                            >
                              {n.severity}
                            </Badge>
                          </div>
                        </Group>
                      </Paper>
                    ))}
                  </Stack>
                );
              })()}
            </Card>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Title order={4} mb="md">
                進捗状況
              </Title>
              <Group justify="center" mb="xl">
                {loading ? (
                  <Center style={{ width: 160, height: 160 }}>
                    <AnimatedRings size={160} />
                  </Center>
                ) : (
                  <div
                    style={{ width: 160, height: 160, position: 'relative' }}
                  >
                    <RingProgress
                      size={160}
                      thickness={14}
                      sections={[{ value: completionRate, color: 'blue' }]}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Text
                        ta="center"
                        fw={700}
                        size="lg"
                        style={{
                          opacity: showNumber ? 1 : 0,
                          transition: 'opacity 420ms ease',
                        }}
                      >
                        {completionRate}%
                      </Text>
                    </div>
                  </div>
                )}
              </Group>
              <Stack gap="xs">
                <Group justify="space-between">
                  <Text size="sm">完了</Text>
                  <Text size="sm" fw={500}>
                    {statusCounts.完了}件
                  </Text>
                </Group>
                <Group justify="space-between">
                  <Text size="sm">確認待ち</Text>
                  <Text size="sm" fw={500}>
                    {statusCounts.確認待ち}件
                  </Text>
                </Group>
                <Group justify="space-between">
                  <Text size="sm">作業中</Text>
                  <Text size="sm" fw={500}>
                    {statusCounts.作業中}件
                  </Text>
                </Group>
                <Group justify="space-between">
                  <Text size="sm">未着手</Text>
                  <Text size="sm" fw={500}>
                    {statusCounts.未着手}件
                  </Text>
                </Group>
              </Stack>
            </Card>

            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Title order={4} mb="md">
                機能ショートカット
              </Title>
              <Stack>
                <Button
                  leftSection={<IconMicrophone size={16} />}
                  variant="subtle"
                >
                  録音→自動作成
                </Button>
                <Button leftSection={<IconSearch size={16} />} variant="subtle">
                  RAG 検索（履歴共有）
                </Button>
                <Button
                  leftSection={<IconChartBar size={16} />}
                  variant="subtle"
                >
                  分析レポート
                </Button>
              </Stack>
            </Card>
          </Stack>
        </Grid.Col>
      </Grid>
    </div>
  );
}

export default DashboardContent;
