/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useTintColor } from '@/hooks/useTintColor';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const theme = useColorScheme() ?? 'light';
  const colorFromProps = props[theme];
  const tintColor = useTintColor();

  if (colorName === 'tint') {
    return tintColor || Colors[theme].tint;
  }
  if (colorFromProps) {
    return colorFromProps;
  }
  return Colors[theme][colorName];
}
