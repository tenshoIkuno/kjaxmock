import React from 'react';
import { Modal, Button, Text, List, Group } from '@mantine/core';
import { useTour } from './TourProvider';
import TourOverlay from './TourOverlay';
import TourStepPopover from './TourStepPopover';
import type { TourStep } from './tourTypes';

type JsonItem = {
  ID: string;
  テキスト: string;
  タイプ?: 'button' | 'nomal' | 'normal';
  // optional: selector to watch for clicks instead of heuristics
  requiredSelector?: string;
};

export default function TourRunner() {
  const {
    activeTour,
    currentIndex,
    isActive,
    startTour,
    next,
    prev,
    complete,
    setCurrentIndex,
  } = useTour();

  const [rect, setRect] = React.useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);

  const [duplicateIds, setDuplicateIds] = React.useState<string[] | null>(null);
  const [showDupModal, setShowDupModal] = React.useState(false);
  const [showDoneModal, setShowDoneModal] = React.useState(false);

  // when done modal is shown, hide overlay/popover and remove any click listeners
  React.useEffect(() => {
    if (showDoneModal) {
      if (clickListenerRef.current) {
        try {
          clickListenerRef.current();
        } catch {}
        clickListenerRef.current = null;
      }
      setRect(null);
    }
  }, [showDoneModal]);

  // store cleanup for click-required steps
  const clickListenerRef = React.useRef<(() => void) | null>(null);

  // helper: build steps from items
  const buildSteps = (items: JsonItem[]): TourStep[] => {
    return items.map((it, idx) => {
      const selector = `#${it.ID}`;
      // normalize types: accept legacy 'nomal'
      const type = it.タイプ === 'nomal' ? 'normal' : it.タイプ;
      const isButton = type === 'button';
      const requiredAction = isButton
        ? { type: 'click' as const, selector: it.requiredSelector ?? selector }
        : null;
      return {
        id: `json-${idx}-${it.ID}`,
        title: it.ID,
        description: it.テキスト,
        targetSelector: selector,
        placement: 'bottom',
        requiredAction,
      } as TourStep;
    });
  };

  // duplicate check
  const findDuplicates = (items: JsonItem[]) => {
    const map = new Map<string, number>();
    for (const it of items) map.set(it.ID, (map.get(it.ID) ?? 0) + 1);
    const d = Array.from(map.entries())
      .filter(([, c]) => c > 1)
      .map(([id]) => id);
    return d;
  };

  // try to fetch default file if event didn't include items
  const fetchJsonFromUrl = async (url: string) => {
    try {
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) return null;
      const data = await res.json();
      if (!Array.isArray(data)) return null;
      return data as JsonItem[];
    } catch {
      return null;
    }
  };

  // listen for JSON start event
  React.useEffect(() => {
    const handler = async (e: any) => {
      console.debug('[TourRunner] startTourFromJson event received', e?.detail);
      let items: JsonItem[] = e?.detail?.items ?? e?.detail ?? [];
      const urlFromDetail: string | undefined = e?.detail?.url;

      if ((!Array.isArray(items) || items.length === 0) && urlFromDetail) {
        console.debug(
          '[TourRunner] fetching from URL in event detail',
          urlFromDetail,
        );
        const fetched = await fetchJsonFromUrl(urlFromDetail);
        if (fetched) items = fetched;
      }

      // if still empty, try default path /product-tour.json
      if (!Array.isArray(items) || items.length === 0) {
        console.debug(
          '[TourRunner] no items in event; trying /product-tour.json',
        );
        const fetched = await fetchJsonFromUrl('/product-tour.json');
        if (fetched) {
          console.debug('[TourRunner] fetched /product-tour.json', fetched);
          items = fetched;
        } else {
          console.debug('[TourRunner] failed to fetch /product-tour.json');
        }
      }

      if (!Array.isArray(items) || items.length === 0) {
        console.debug('[TourRunner] no tour items available; aborting');
        return;
      }

      // check duplicates
      const dups = findDuplicates(items as JsonItem[]);
      if (dups.length > 0) {
        setDuplicateIds(dups);
        setShowDupModal(true);
        return;
      }

      const steps = buildSteps(items as JsonItem[]);
      console.debug(
        '[TourRunner] starting tour with steps',
        steps.map((s) => s.id),
      );
      startTour({ id: `json-tour-${Date.now()}`, title: 'JSON Tour', steps });
    };
    window.addEventListener('startTourFromJson', handler as EventListener);
    return () =>
      window.removeEventListener('startTourFromJson', handler as EventListener);
  }, [startTour]);

  // when activeTour or index changes, find target element (wait until exists)
  React.useEffect(() => {
    let mounted = true;
    let pollId: number | null = null;

    // clean previous click listener
    if (clickListenerRef.current) {
      clickListenerRef.current();
      clickListenerRef.current = null;
    }

    async function findTarget() {
      if (!activeTour) {
        setRect(null);
        return;
      }
      const step = activeTour.steps[currentIndex];
      if (!step) return;

      const selector = step.targetSelector ?? null;

      const attempt = () => {
        if (!mounted) return;
        let el: Element | null = null;
        try {
          if (selector) el = document.querySelector(selector);
        } catch (e) {
          el = null;
        }
        if (el) {
          const r = (el as HTMLElement).getBoundingClientRect();
          const top = r.top + window.scrollY;
          const left = r.left + window.scrollX;
          setRect({ top, left, width: r.width, height: r.height });
          // ensure visible
          try {
            (el as HTMLElement).scrollIntoView({
              block: 'center',
              behavior: 'smooth',
            });
          } catch {}

          // try to focus the target (or a focusable child) to keep keyboard focus
          try {
            const elHost = el as HTMLElement;
            const focusableSelector =
              'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
            let toFocus: HTMLElement | null = null;
            if (elHost.matches && (elHost as any).matches(focusableSelector)) {
              toFocus = elHost;
            } else {
              toFocus =
                (elHost.querySelector
                  ? (elHost.querySelector(
                      focusableSelector,
                    ) as HTMLElement | null)
                  : null) || null;
            }

            if (!toFocus) {
              // make the element temporarily focusable
              const prev = elHost.getAttribute('tabindex');
              elHost.setAttribute('tabindex', '-1');
              elHost.focus({ preventScroll: true } as any);
              if (prev === null) elHost.removeAttribute('tabindex');
              else elHost.setAttribute('tabindex', prev);
            } else {
              toFocus.focus({ preventScroll: true } as any);
            }
          } catch (e) {
            // ignore focus errors
          }

          // if requiredAction is click, attach listener that advances only when
          // the element matching the required selector is clicked.
          if (
            step.requiredAction &&
            (step.requiredAction as any).type === 'click'
          ) {
            const reqSel = (step.requiredAction as any).selector as
              | string
              | undefined;
            const selectorToUse = reqSel ?? selector ?? null;
            if (selectorToUse) {
              const handler = (ev: Event) => {
                const t = ev.target as HTMLElement | null;
                try {
                  // Debug: log click targets for troubleshooting
                  console.debug('[TourRunner] click handler', {
                    selector: selectorToUse,
                    target: t,
                    type: ev.type,
                  });

                  // Use composedPath if available to support shadow DOM / inner elements
                  let path: EventTarget[] = [];
                  if ((ev as any).composedPath) {
                    path = (ev as any).composedPath();
                  } else {
                    // build fallback path by walking up from target
                    let cur: HTMLElement | null = t as HTMLElement | null;
                    while (cur) {
                      path.push(cur);
                      cur = cur.parentElement;
                    }
                  }

                  // check if any element in the path matches the selector
                  let matched = false;
                  if (selectorToUse) {
                    for (const p of path) {
                      try {
                        if (
                          p &&
                          (p as Element).matches &&
                          (p as Element).matches(selectorToUse)
                        ) {
                          matched = true;
                          break;
                        }
                      } catch (e) {
                        // ignore invalid selector errors
                      }
                    }
                  }

                  console.debug('[TourRunner] click matched?', { matched });
                  if (matched) {
                    // if this is the last step, show the done modal instead of advancing
                    try {
                      const isLast =
                        !!activeTour &&
                        currentIndex === activeTour.steps.length - 1;
                      if (isLast) {
                        setShowDoneModal(true);
                      } else {
                        next();
                      }
                    } catch (e) {
                      next();
                    }
                  }
                } catch (e) {
                  // ignore any errors in click handler
                }
              };
              document.addEventListener('click', handler, true);
              clickListenerRef.current = () =>
                document.removeEventListener('click', handler, true);
            }
          }
        } else {
          setRect(null);
          // keep polling until found
          pollId = window.setTimeout(attempt, 300);
        }
      };

      attempt();
    }

    findTarget();
    return () => {
      mounted = false;
      if (pollId) window.clearTimeout(pollId);
      if (clickListenerRef.current) {
        clickListenerRef.current();
        clickListenerRef.current = null;
      }
    };
  }, [activeTour, currentIndex, next]);

  if (!isActive || !activeTour) {
    // still show duplicate modal if needed even when no active tour
    return (
      <>
        <Modal
          opened={showDupModal}
          onClose={() => setShowDupModal(false)}
          title="IDの重複が見つかりました"
          zIndex={20000}
        >
          <Text>
            JSON 配列内に同一の ID が複数存在します。修正してください:
          </Text>
          <List mt="sm">
            {duplicateIds?.map((id) => (
              <List.Item key={id}>{id}</List.Item>
            ))}
          </List>
          <Group position="right" mt="md">
            <Button onClick={() => setShowDupModal(false)}>閉じる</Button>
          </Group>
        </Modal>
      </>
    );
  }

  const step = activeTour.steps[currentIndex];
  const total = activeTour.steps.length;

  // wrapper: when the UI requests completion, show a centered "お疲れ様でした" modal
  // and only call the context `complete()` after the user dismisses it.
  const requestComplete = () => {
    setShowDoneModal(true);
  };

  const handleCloseDoneModal = () => {
    setShowDoneModal(false);
    // actually complete the tour
    complete();
  };

  return (
    <>
      {!showDoneModal && (
        <>
          <TourOverlay rect={rect} />
          <TourStepPopover
            step={step}
            rect={rect}
            onNext={() => next()}
            onComplete={requestComplete}
            index={currentIndex}
            total={total}
          />
        </>
      )}

      <Modal
        opened={showDoneModal}
        onClose={handleCloseDoneModal}
        centered
        title="お疲れ様でした"
        zIndex={20000}
      >
        <Text>ツアーは完了しました。ご利用ありがとうございました。</Text>
        <Group position="right" mt="md">
          <Button onClick={handleCloseDoneModal}>閉じる</Button>
        </Group>
      </Modal>
    </>
  );
}
