import { CssLoader } from '@/common/theme/Loader/CssLoader';
import { createTheme, Loader } from '@mantine/core';

// Mantineテーマ設定
// 要素の追加方法 https://mantine.dev/theming/theme-object/
export const theme = createTheme({
  components: {
    Tooltip: {
      defaultProps: {
        withArrow: true,
        closeDelay: 100,
        multiline: true,
        transitionProps: { transition: 'fade', duration: 120 },
      },
      styles: () => ({
        tooltip: {
          fontSize: '10px',
        },
      }),
    },
    Loader: Loader.extend({
      defaultProps: {
        loaders: { ...Loader.defaultLoaders, custom: CssLoader },
        type: 'custom',
      },
    }),
  },
});
