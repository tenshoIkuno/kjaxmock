/**
 * List コンポーネント（汎用テーブル）
 * --------------------------------------
 * columns: 表示するカラム定義の配列
 * data:    表示する行データの配列
 *
 * 各カラムには以下を指定できます：
 * - key:   データのキー
 * - label: テーブルヘッダに表示する文字
 * - align?: 任意。文字の位置（'left' | 'center' | 'right'）
 * - render?: (row) => ReactNode
 *      任意。行データ row を受け取り、表示する JSX を返せる。
 *      これを使うと、表示内容を自由にカスタマイズできる。
 *
 * 使用例：
 * const columns = [
 *   { key: 'name', label: '名前' },
 *   {
 *     key: 'email',
 *     label: 'メール',
 *     align: 'right',
 *     render: (row) => <a href={`mailto:${row.email}`}>{row.email}</a>,
 *   },
 * ];
 *
 * <List columns={columns} data={users} />
 *
 * render を指定したカラムは、その戻り値の JSX が優先して表示されます。
 * 指定がない場合は row[key] の値がそのまま表示されます。
 */
import { Table, ScrollArea } from '@mantine/core';

type Column<T> = {
  key: keyof T | string;
  label: string;
  render?: (row: T) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  // optional fixed width for the column (e.g. '120px' or 120)
  width?: string | number;
  // if true, cell content will be truncated with ellipsis
  ellipsis?: boolean;
};

export const List = <T,>({
  columns,
  data,
  // optional props
  minWidth = '100%',
  tableLayout = 'auto',
}: {
  columns: readonly Column<T>[];
  data: T[];
  minWidth?: string | number;
  tableLayout?: 'fixed' | 'auto';
}) => {
  return (
    <ScrollArea style={{ width: '100%' }}>
      <div style={{ minWidth }}>
        <Table stickyHeader striped sx={{ tableLayout }}>
          <colgroup>
            {columns.map((c, idx) => (
              <col
                key={String(c.key) + '-col-' + idx}
                style={
                  c.width
                    ? { width: typeof c.width === 'number' ? `${c.width}px` : c.width }
                    : undefined
                }
              />
            ))}
          </colgroup>

          <Table.Thead>
            <Table.Tr>
              {columns.map((c) => (
                <Table.Th key={String(c.key)} style={{ textAlign: c.align ?? 'left' }}>
                  {c.label}
                </Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>

          <Table.Tbody>
            {data.map((row, i) => (
              <Table.Tr key={i}>
                {columns.map((c, ci) => (
                  <Table.Td
                    key={String(c.key) + '-cell-' + ci}
                    style={{ textAlign: c.align ?? 'left', verticalAlign: 'middle' }}
                  >
                    {c.render ? (
                      c.render(row)
                    ) : (
                      <div
                        style={{
                          overflow: c.ellipsis ? 'hidden' : undefined,
                          textOverflow: c.ellipsis ? 'ellipsis' : undefined,
                          whiteSpace: c.ellipsis ? 'nowrap' : undefined,
                        }}
                      >
                        {(row as any)[c.key]}
                      </div>
                    )}
                  </Table.Td>
                ))}
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </div>
    </ScrollArea>
  );
};
