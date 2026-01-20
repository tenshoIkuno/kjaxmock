export function openOnboarding(page: string) {
  try {
    // debug log for tracing
    // eslint-disable-next-line no-console
    console.debug('[Onboarding] openOnboarding dispatch', page);
    window.dispatchEvent(
      new CustomEvent('openOnboarding', { detail: { page } }),
    );
  } catch (e) {
    // noop
  }
}
