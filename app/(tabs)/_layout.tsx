import { Tabs } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { colors } from '@/src/constants/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.forestDark,
        tabBarInactiveTintColor: colors.inkSoft,
        tabBarStyle: { backgroundColor: colors.paper, borderTopColor: colors.line },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Início', tabBarIcon: ({ color, size }) => <Feather name="home" color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="leitura"
        options={{ title: 'Leitura', tabBarIcon: ({ color, size }) => <Feather name="book-open" color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="busca"
        options={{ title: 'Busca', tabBarIcon: ({ color, size }) => <Feather name="search" color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="favoritos"
        options={{ title: 'Favoritos', tabBarIcon: ({ color, size }) => <Feather name="heart" color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="planos"
        options={{ title: 'Planos', tabBarIcon: ({ color, size }) => <Feather name="calendar" color={color} size={size} /> }}
      />
    </Tabs>
  );
}
