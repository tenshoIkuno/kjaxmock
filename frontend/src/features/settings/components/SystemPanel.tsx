import {
  Stack,
  Switch,
  Text,
  useComputedColorScheme,
  useMantineColorScheme,
} from '@mantine/core';

export const SystemPanel = () => {
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('light');

  const isDark = computedColorScheme === 'dark';

  const handleToggleTheme = () => {
    setColorScheme(isDark ? 'light' : 'dark');
  };

  return (
    <Stack mt="xs" gap="xs">
      <Text fw={600}>システム設定</Text>

      <Switch
        checked={isDark}
        onChange={handleToggleTheme}
        label="ダークモード"
        labelPosition="left"
        onLabel="ON"
        offLabel="OFF"
      ></Switch>
    </Stack>
  );
};
