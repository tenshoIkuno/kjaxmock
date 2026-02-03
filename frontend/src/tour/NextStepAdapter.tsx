import React from 'react';
import { NextStepProvider, NextStepReact, useNextStep } from 'nextstepjs';

type JsonItem = {
  ID: string;
  テキスト: string;
  タイプ?: 'button' | 'nomal' | 'normal';
  requiredSelector?: string;
};

type JsonTour = {
  name: string;
  items: JsonItem[];
};

function Inner({ tours }: { tours: any[] }) {
  const { startNextStep, setCurrentStep, currentTour, currentStep } =
    useNextStep();

  // listen for start event that may include a tour name or URL
  React.useEffect(() => {
    const handler = async (e: any) => {
      let detail = e?.detail ?? {};
      if (detail?.url) {
        try {
          const res = await fetch(detail.url, { cache: 'no-store' });
          const data = await res.json();
          if (Array.isArray(data)) {
            // if the fetched JSON is an array of tours, pick the first by name in detail
            const name = detail?.name ?? data[0]?.name;
            if (name) startNextStep(name);
          }
        } catch {}
      } else if (detail?.name) {
        startNextStep(detail.name);
      } else {
        // default: start first tour if exists
        if (tours && tours.length > 0) startNextStep(tours[0].tour);
      }
    };
    window.addEventListener('startTourFromJson', handler as EventListener);
    return () =>
      window.removeEventListener('startTourFromJson', handler as EventListener);
  }, [startNextStep, tours]);

  // implement click-gating for steps that include a custom `requiredSelector` property
  React.useEffect(() => {
    if (!currentTour) return;
    const tour = tours.find((t) => t.tour === currentTour);
    if (!tour) return;
    const step = tour.steps?.[currentStep];
    if (!step) return;

    const req = (step as any).requiredSelector as string | undefined;
    if (!req) return;

    const handler = (ev: Event) => {
      try {
        const target = ev.target as HTMLElement | null;
        // fast path: use closest on the target
        if (target && typeof target.closest === 'function') {
          const found = target.closest(req);
          if (found) {
            console.debug('[NextStepAdapter] matched by closest', {
              req,
              target,
            });
            setCurrentStep((currentStep ?? 0) + 1);
            return;
          }
        }

        // fallback: composedPath (shadow DOM) or manual path walk
        const path: EventTarget[] = (ev as any).composedPath
          ? (ev as any).composedPath()
          : [];
        if (path.length === 0) {
          let t = target as HTMLElement | null;
          while (t) {
            path.push(t);
            t = t.parentElement;
          }
        }

        for (const p of path) {
          try {
            const el = p as Element | null;
            if (!el) continue;
            if (el.matches && el.matches(req)) {
              console.debug('[NextStepAdapter] matched in path', { req, el });
              setCurrentStep((currentStep ?? 0) + 1);
              return;
            }
          } catch (err) {
            // ignore invalid selector errors
          }
        }
      } catch (err) {
        console.debug('[NextStepAdapter] click handler error', err);
      }
    };

    document.addEventListener('click', handler, true);
    return () => document.removeEventListener('click', handler, true);
  }, [currentTour, currentStep, tours, setCurrentStep]);

  return null;
}

export default function NextStepAdapter() {
  const [tours, setTours] = React.useState<any[] | null>(null);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/product-tour.json', { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        if (!Array.isArray(data)) return;

        const mapped = data.map((t: JsonTour) => ({
          tour: t.name,
          steps: (t.items || []).map((it: JsonItem) => ({
            selector: `#${it.ID}`,
            title: it.ID,
            content: it.テキスト,
            side: 'bottom',
            // hide controls for button steps so user must click target
            showControls: it.タイプ !== 'button',
            requiredSelector:
              it.requiredSelector ??
              (it.タイプ === 'button' ? `#${it.ID}` : undefined),
          })),
        }));

        if (mounted) setTours(mapped);
      } catch (e) {
        // ignore
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (!tours) return null;

  return (
    <NextStepProvider>
      <NextStepReact steps={tours} clickThroughOverlay={true} />
      <Inner tours={tours} />
    </NextStepProvider>
  );
}
