import { Layout } from '@/common/layout/Layout';
import { fetchCsrfToken } from '@/common/security/csrf';
import { fetchMe } from '@/features/auth/api/auth';
import { useAuthStore } from './features/auth/store/authStore';
import { theme } from '@/common/theme/theme';
import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import { Notifications } from '@mantine/notifications';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import { LoginPage } from './features/auth/Login';
import OnboardingModal from '@/common/components/Onboarding/Onboarding';
import ProductTourModal from '@/common/components/ProductTour/ProductTour';
import { TourProvider } from '@/tour/TourProvider';
import TourRunner from '@/tour/TourRunner';

const queryClient = new QueryClient();

// MantineProviderが肥大化するようなら core/ThemeProvider.tsx に分離する
function App() {
  useEffect(() => {
    (async () => {
      try {
        await fetchCsrfToken();
        const me = await fetchMe();
        // ensure role default when backend doesn't provide it
        const withRole = me && !me.role ? { ...me, role: '担当職員' } : me;
        useAuthStore.getState().setUser(withRole);
      } catch (e) {
        // not authenticated or fetch error — keep user null so LoginPage shows
        // console.warn(e);
      }
    })();
  }, []);

  const { user } = useAuthStore();
  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider theme={theme} defaultColorScheme="auto">
        <Notifications position="top-right" autoClose={3000} />
        <TourProvider>
          <OnboardingModal />
          <ProductTourModal />
          <TourRunner />
          {/* userが存在すればLayoutページ、そうでなければログインページを表示 */}
          {!user ? <LoginPage /> : <Layout />}
        </TourProvider>
      </MantineProvider>
    </QueryClientProvider>
  );
}

export default App;
