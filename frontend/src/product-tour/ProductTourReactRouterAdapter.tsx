'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';

// ProductTourNextAdapter
// - `product-tour-navigate` を受け取り Next.js Router で遷移します
// - ルート変更時に `product-tour-resume` を発火して復帰を促します

export default function ProductTourNextAdapter() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function onRequestNavigate(e: any) {
      try {
        const url = e && e.detail && e.detail.url;
        if (!url) return;
        // 同一オリジンの場合はクライアント遷移を優先
        try {
          const next = new URL(url, window.location.origin);
          if (next.origin === window.location.origin) {
            router.push(next.pathname + next.search + next.hash);
            return;
          }
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
          // 続行（次のフォールバックへ）
        }
        // フォールバックで全ページ遷移を行う
        window.location.href = url;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        // ignore
      }
    }

    window.addEventListener(
      'product-tour-navigate',
      onRequestNavigate as EventListener,
    );
    return () =>
      window.removeEventListener(
        'product-tour-navigate',
        onRequestNavigate as EventListener,
      );
  }, [router]);

  useEffect(() => {
    // SPA でルートが変わったらローダーに復帰を通知
    // ルート変更時にローダーに復帰を通知（描画の猶予を与えるため短い遅延を入れる）
    try {
      setTimeout(() => {
        try {
          window.dispatchEvent(new Event('product-tour-resume'));
          // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-empty
        } catch (e) {}
      }, 250);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-empty
    } catch (e) {}
  }, [pathname, searchParams]);

  return null;
}
