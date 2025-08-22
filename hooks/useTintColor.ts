import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';

export function useTintColor() {
  const { profile } = useAuth();
  const theme = useColorScheme() ?? 'light';
  return profile?.favoriteColor || Colors[theme].tint;
}