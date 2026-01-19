import { FifthPanel } from '@/features/patrol-audit/components/panel/FifthPanel';
import { FirstPanel } from '@/features/patrol-audit/components/panel/FirstPanel';
import { FourthPanel } from '@/features/patrol-audit/components/panel/FourthPanel';
import { SecondPanel } from '@/features/patrol-audit/components/panel/SecondPanel';
import { ThirdPanel } from '@/features/patrol-audit/components/panel/ThirdPanel';
import { PatrolAuditCheckModal } from '@/features/patrol-audit/components/PatrolAuditCheckModal';
import { usePatrolAudit } from '@/features/patrol-audit/hooks/usePatrolAudit';
import { SpeechForm } from '@/features/speech/components/SpeechForm';
import {
  Box,
  Button,
  Divider,
  Flex,
  Group,
  Paper,
  Stepper,
} from '@mantine/core';
import { useState, useEffect } from 'react';
import type { inputPatrolAudit } from '@/features/patrol-audit/types/patrolAudit';

type Props = {
  activeStep: number;
  onNext: () => void;
  onPrev: () => void;
  onBackToList: () => void;
  onStepClick: (step: number) => void;
  initialValues?: Partial<inputPatrolAudit>;
};

export const PatrolAuditCreatePage: React.FC<Props> = ({
  activeStep,
  onNext,
  onPrev,
  onBackToList,
  onStepClick,
  initialValues,
}) => {
  const { values: formValues, updateValues } = usePatrolAudit();
  const [confirmModalOpened, setConfirmModalOpened] = useState(false);

  useEffect(() => {
    if (initialValues) {
      updateValues(initialValues as any);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValues && JSON.stringify(initialValues)]);

  return (
    <>
      <Flex direction="column" h="100%">
        {/* main 内ヘッダー：コンパクトだけどラインは太めの Stepper */}
        <Group justify="space-between" px="md" py="xs" align="flex-start">
          <Group align="center" gap="sm" style={{ flex: 1 }}>
            {/* 左上：一覧に戻る（追加要望） */}
            <Button variant="subtle" onClick={onBackToList} size="xs">
              戻る
            </Button>
            {/* 左：Stepper（横並び＋幅を絞ってコンパクトに） */}
            <Box maw={700} w="100%">
            <Stepper
              active={activeStep}
              size="md"
              iconSize={26}
              color="blue.6"
              onStepClick={onStepClick}
              styles={(theme) => ({
                separator: {
                  borderTopWidth: 2,
                  borderColor: theme.colors.blue[6],
                  opacity: 1,
                },
              })}
            >
              <Stepper.Step label="基本情報" />
              <Stepper.Step label="監査範囲" />
              <Stepper.Step label="指摘事項" />
              <Stepper.Step label="是正計画" />
              <Stepper.Step label="受領確認" />
            </Stepper>
          </Box>
          </Group>

          {/* 右：一覧に戻るボタン */}
          <Group gap="xs">
            <Button variant="default" onClick={onBackToList}>
              一覧に戻る
            </Button>
          </Group>
        </Group>

        <Divider />

        {/* 本体：左パネル / 右 Chat */}
        <Flex flex={1} h="100%" px="md" py="md" gap="md">
          {/* 左：ステップに応じて内容が変わるパネル（枠で囲む） */}
          <Box
            w="32%"
            h="100%"
            style={{ minWidth: 0, display: 'flex', flexDirection: 'column' }}
          >
            <Paper
              withBorder
              shadow="xs"
              radius="md"
              p="md"
              style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
              }}
            >
              {activeStep === 0 && (
                <FirstPanel values={formValues} onChange={updateValues} />
              )}
              {activeStep === 1 && (
                <SecondPanel values={formValues} onChange={updateValues} />
              )}
              {activeStep === 2 && <ThirdPanel />}
              {activeStep === 3 && <FourthPanel />}
              {activeStep === 4 && (
                <FifthPanel values={formValues} onChange={updateValues} />
              )}
              <Group justify="space-between" mt="auto">
                <Button
                  variant="default"
                  onClick={onPrev}
                  disabled={activeStep === 0}
                >
                  戻る
                </Button>
                {activeStep < 4 ? (
                  <Button onClick={onNext}>次へ</Button>
                ) : (
                  <Button onClick={() => setConfirmModalOpened(true)}>
                    確認
                  </Button>
                )}
              </Group>
            </Paper>
          </Box>

          {/* 右：Chat 画面（こちらも枠で囲む） */}
          <Box
            w="68%"
            h="100%"
            style={{ minWidth: 0, display: 'flex', flexDirection: 'column' }}
          >
            <Paper
              withBorder
              shadow="xs"
              radius="md"
              p="md"
              style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
              }}
            >
              <SpeechForm />
            </Paper>
          </Box>
        </Flex>
      </Flex>

      {/* 入力内容の確認モーダル */}
      <PatrolAuditCheckModal
        opened={confirmModalOpened}
        onClose={() => setConfirmModalOpened(false)}
        formValues={formValues}
      />
    </>
  );
};
