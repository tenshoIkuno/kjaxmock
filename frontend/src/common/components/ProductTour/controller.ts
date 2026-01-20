export function openProductTour(page: string) {
  try {
    // eslint-disable-next-line no-console
    console.debug('[ProductTour] openProductTour dispatch', page);
    window.dispatchEvent(
      new CustomEvent('openProductTour', { detail: { page } }),
    );
  } catch (e) {
    // noop
  }
}
