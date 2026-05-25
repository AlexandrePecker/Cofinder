import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { StyleSheet, type ColorValue } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

function makeTabIcon(outline: IoniconName, filled: IoniconName) {
  function TabIcon({ color, focused }: { color: ColorValue; focused: boolean }) {
    return <Ionicons name={focused ? filled : outline} size={22} color={color as string} />;
  }
  return TabIcon;
}

export default function TabLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
          borderTopWidth: StyleSheet.hairlineWidth,
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Próximas',
          tabBarIcon: makeTabIcon('cafe-outline', 'cafe'),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Favoritos',
          tabBarIcon: makeTabIcon('heart-outline', 'heart'),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: makeTabIcon('person-outline', 'person'),
        }}
      />
    </Tabs>
  );
}
