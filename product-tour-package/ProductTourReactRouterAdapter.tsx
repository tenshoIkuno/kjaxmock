import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// ProductTourReactRouterAdapter
// - `product-tour-navigate` を受け取り React Router で遷移します
// - ルート変更時に `product-tour-resume` を発火して復帰を促します

export default function ProductTourReactRouterAdapter() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    function onRequestNavigate(e: any) {
      try {
        const url = e && e.detail && e.detail.url;
        if (!url) return;
        // 同一オリジンの場合はクライアント遷移を優先
        try {
          const next = new URL(url, window.location.origin);
          if (next.origin === window.location.origin) {
            navigate(next.pathname + next.search + next.hash);
            return;
          }
        } catch (err) {
          // 続行（次のフォールバックへ）
        }
        // フォールバックで全ページ遷移を行う
        window.location.href = url;
      } catch (err) {
        // ignore
      }
    }

    window.addEventListener(
      "product-tour-navigate",
      onRequestNavigate as EventListener,
    );
    return () =>
      window.removeEventListener(
        "product-tour-navigate",
        onRequestNavigate as EventListener,
      );
  }, [navigate]);

  useEffect(() => {
    // SPA でルートが変わったらローダーに復帰を通知
    // ルート変更時にローダーに復帰を通知（描画の猶予を与えるため短い遅延を入れる）
    try {
      setTimeout(() => {
        try {
          window.dispatchEvent(new Event("product-tour-resume"));
        } catch (e) {}
      }, 250);
    } catch (e) {}
  }, [location.pathname, location.search, location.hash]);

  return null;
}
