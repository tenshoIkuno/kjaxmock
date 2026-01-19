import { DashboardModal } from '@/common/dashboard/Modal';
import { useClients } from '@/features/client/hooks/useClient';
import { useClientStore } from '@/features/client/store/clientStore';
import { PatrolAuditCreatePage } from '@/features/patrol-audit/components/PatrolAuditCreatePage';
import { PatrolAuditListPage } from '@/features/patrol-audit/components/PatrolAuditListPage';
import { PatrolAuditHistoryPage } from '@/features/patrol-audit/components/PatrolAuditHistoryPage';
import { Button, Group, Select, Stack } from '@mantine/core';
import { useState, useEffect } from 'react';
import { useCommonStore } from '@/common/store/commonStore';
type Mode = 'list' | 'create' | 'history';

export const PatrolAuditPage = () => {
  // 顧問先一覧（API）を取得
  const { data: clients } = useClients();

  // 選択した顧問先をグローバルに保持（ヘッダー表示用）
  const { selectClient } = useClientStore();

  const [mode, setMode] = useState<Mode>('list');
  const [activeStep, setActiveStep] = useState(0);
  const [modalOpened, setModalOpened] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [editingAudit, setEditingAudit] = useState<any | null>(null);
  const [modalTriggerMode, setModalTriggerMode] = useState<'none' | 'create' | 'history'>('none');
  const buildInitialValues = (audit: any) => {
    // audit のフィールドを inputPatrolAudit へマッピングする
    // audit.date は 'YYYY-MM-DD' 形式で入っている想定
    return {
      periodStart: null,
      periodEnd: null,
      visitDate: audit?.date ?? null,
      visitMethod: '',
      nextVisitDate: null,

      selected: [],
      otherSelected: false,
      otherText: '',

      confirmMethod: '',
      confirmDate: null,
      confirmer: audit?.auditor ?? '',
    };
  };

  const nextStep = () => setActiveStep((prev) => (prev < 4 ? prev + 1 : prev));

  const prevStep = () => setActiveStep((prev) => (prev > 0 ? prev - 1 : prev));

  const handleStepClick = (step: number) => {
    setActiveStep(step);
  };

  // react to navbar-triggered modal requests
  const patrolAuditModalMode = useCommonStore((s) => s.patrolAuditModalMode);
  const setPatrolAuditModalMode = useCommonStore((s) => s.setPatrolAuditModalMode);
  const patrolAuditRequestedMode = useCommonStore((s) => s.patrolAuditRequestedMode);
  const patrolAuditRequestedClientId = useCommonStore((s) => s.patrolAuditRequestedClientId);
  const clearPatrolAuditRequested = useCommonStore((s) => s.clearPatrolAuditRequested);

  useEffect(() => {
    if (patrolAuditModalMode === 'create' || patrolAuditModalMode === 'history') {
      setModalOpened(true);
      setModalTriggerMode(patrolAuditModalMode);
      // reset global flag
      setPatrolAuditModalMode('none');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patrolAuditModalMode]);

  // When navigated to patrolAudit page because of a header/global request,
  // open the target view (create/history) for the requested client.
  useEffect(() => {
    if (patrolAuditRequestedMode !== 'none') {
      // If a clientId was provided, proceed to the requested view.
      if (patrolAuditRequestedClientId) {
        selectClient(patrolAuditRequestedClientId);
        setActiveStep(0);
        setMode(patrolAuditRequestedMode === 'history' ? 'history' : 'create');
      } else {
        // No client provided: force the header's tenant-select modal to open
        // so the user must choose a client before viewing history/create.
        useCommonStore.getState().setPatrolAuditModalMode(patrolAuditRequestedMode);
      }
      clearPatrolAuditRequested();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patrolAuditRequestedMode, patrolAuditRequestedClientId]);

  // 一覧画面
  if (mode === 'list') {
    return (
      <>
        <PatrolAuditListPage
          onClickCreate={(audit) => {
            if (audit) {
              // 編集要求: 顧問先名から client を探して、見つかれば直接作成画面へ遷移
              const found = (clients ?? []).find((c) => c.name === audit.clientName);
              if (found) {
                // ヘッダー表示用に選択顧問先をストアに反映
                selectClient(found.id);
                // 編集対象をセットして作成画面へ遷移（編集モード）
                setEditingAudit(audit);
                setActiveStep(0);
                setMode('create');
                setModalOpened(false);
                return;
              }
              // 顧問先が見つからない場合でも、顧問先選択は不要にする（行の顧問先名を表示）
              useClientStore.getState().selectClientName(audit.clientName);
              setEditingAudit(audit);
              setActiveStep(0);
              setMode('create');
              setModalOpened(false);
              return;
            }

            // 新規作成
            setEditingAudit(null);
            useClientStore.getState().selectClientName(null);
            setModalTriggerMode('create');
            setModalOpened(true); // ← モーダルを開く
            setSelectedClientId(null); // ← 選択状態をリセット
          }}
        />

        <DashboardModal
          opened={modalOpened}
          onClose={() => {
            setModalOpened(false);
            setModalTriggerMode('none');
          }}
          title={modalTriggerMode === 'history' ? '監査履歴' : '巡回監査報告作成'}
        >
          <Stack gap="md">
            <Select
              label="顧問先"
              placeholder="顧問先名で検索"
              searchable // ← 入力で絞り込み
              clearable // ← 入力クリア
              nothingFoundMessage="該当する顧問先がありません"
              data={(clients ?? []).map((c) => ({
                value: c.id,
                label: c.name,
              }))}
              value={selectedClientId}
              onChange={setSelectedClientId}
              sx={{ userSelect: 'text' }}
            />

            <Group justify="flex-end" mt="sm">
              <Button variant="default" onClick={() => {
                setModalOpened(false);
                setModalTriggerMode('none');
              }}>
                キャンセル
              </Button>
              <Button
                onClick={() => {
                  if (!selectedClientId) return;
                  // If this modal was opened for history view, select the client and stay on list
                  if (modalTriggerMode === 'history') {
                    // For 'history' mode, show the history/detail screen
                    selectClient(selectedClientId);
                    setActiveStep(0);
                    setMode('history');
                    setModalOpened(false);
                    setModalTriggerMode('none');
                    return;
                  }
                  // Otherwise, proceed to create flow
                  selectClient(selectedClientId);
                  setActiveStep(0);
                  setMode('create');
                  setModalOpened(false);
                  setModalTriggerMode('none');
                }}
                disabled={!selectedClientId}
              >
                {modalTriggerMode === 'history' ? '表示' : '作成開始'}
              </Button>
            </Group>
          </Stack>
        </DashboardModal>
      </>
    );
  }

  // 作成画面
  if (mode === 'create') {
    return (
      <PatrolAuditCreatePage
        activeStep={activeStep}
        onNext={nextStep}
        onPrev={prevStep}
        onBackToList={() => setMode('list')}
        onStepClick={handleStepClick}
        initialValues={editingAudit ? buildInitialValues(editingAudit) : undefined}
      />
    );
  }

  // 履歴表示画面
  return <PatrolAuditHistoryPage />;
};
