// Shim for `next/navigation` used by nextstepjs when bundling with Vite.
export function useRouter() {
  return {
    push: (path: string) => {
      if (typeof window !== 'undefined') {
        window.history.pushState({}, '', path);
        window.dispatchEvent(new PopStateEvent('popstate', { state: {} }));
      }
    },
    replace: (path: string) => {
      if (typeof window !== 'undefined') {
        window.history.replaceState({}, '', path);
        window.dispatchEvent(new PopStateEvent('popstate', { state: {} }));
      }
    },
    back: () => {
      if (typeof window !== 'undefined') window.history.back();
    },
  };
}

export function usePathname() {
  if (typeof window === 'undefined') return '/';
  return window.location.pathname;
}
