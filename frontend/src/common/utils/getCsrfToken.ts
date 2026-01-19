export const getCsrfToken = (): string | null => {
  // CookieからCSRFトークンを取得
  const csrfToken = document.cookie
    .split('; ')
    .find((c) => c.startsWith('csrf_token='))
    ?.split('=')[1];

  return csrfToken || null;
};
