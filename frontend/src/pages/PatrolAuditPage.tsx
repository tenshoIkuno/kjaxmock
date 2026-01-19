// import { PatrolAuditTable } from '@/features/patrol-audit/components/PatrolAuditTable';
// import { SearchInput } from '@/features/patrol-audit/components/SearchInput';
// import { Box, Flex, Paper, Stack, Text } from '@mantine/core';
// import { useState } from 'react';

// export function PatrolAuditPage() {
//   // 検索用ステート
//   const [search, setSearch] = useState('');

//   return (
//     <Flex direction="column" p="lg" style={{ flex: 1, minHeight: 0 }}>
//       <Stack gap="md" style={{ flex: 1 }}>
//         {/* ページタイトル */}
//         <Text fw={700} size="lg">
//           巡回監査報告書
//         </Text>

//         {/* 検索欄 */}
//         <Paper p="md" withBorder shadow="xs">
//           <SearchInput
//             value={search}
//             onChange={setSearch}
//             placeholder="顧問先名・対象期間などを検索"
//             size="sm"
//           />
//         </Paper>

//         {/* テーブル */}
//         <Box style={{ flex: 1, minHeight: 0 }}>
//           <PatrolAuditTable />
//         </Box>
//       </Stack>
//     </Flex>
//   );
// }
