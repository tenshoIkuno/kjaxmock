import { TextInput } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';

type ClientListSearchProps = {
  // 現在の検索文字列（親コンポーネント側の state）
  searchText: string;
  // 検索文字列が変わったときに呼ばれるコールバック
  setSearchText: (value: string) => void;
};

export const ClientListSearch = ({
  searchText,
  setSearchText,
}: ClientListSearchProps) => {
  return (
    <TextInput
      placeholder="顧問先名で検索"
      size="xs"
      leftSection={<IconSearch size={14} />}
      value={searchText}
      onChange={(e) => setSearchText(e.currentTarget.value)}
    />
  );
};
