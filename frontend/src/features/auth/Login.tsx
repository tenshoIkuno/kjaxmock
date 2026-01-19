import { startLogin } from '@/features/auth/api/auth';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Button, Center, LoadingOverlay, Stack, Text } from '@mantine/core';

export const LoginPage: React.FC = () => {
  const query = useAuth();

  return (
    <>
      <Center h="100vh">
        <LoadingOverlay visible={query.isLoading} zIndex={1000} />
        <Stack align="center" gap="md">
          <Text>会計事務所向けAXソリューション</Text>
          <Text size="lg" fw={500}>
            ログインはこちら
          </Text>
          <Button variant="filled" onClick={startLogin}>
            ログイン
          </Button>
        </Stack>
      </Center>
    </>
  );
};
