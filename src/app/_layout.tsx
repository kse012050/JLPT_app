import { Tabs } from 'expo-router';
import { SymbolView, type AndroidSymbol, type SFSymbol } from 'expo-symbols';
import { type ColorValue } from 'react-native';

function TabIcon({ android, ios, color }: { android: AndroidSymbol; ios: SFSymbol; color: ColorValue }) {
  return <SymbolView name={{ android, web: android, ios }} tintColor={color} size={22} />;
}

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: '#EF3863',
      tabBarInactiveTintColor: '#A5A0A4',
      tabBarStyle: { backgroundColor: '#FFFFFF', borderTopColor: '#F0E8E7', height: 63, paddingTop: 5 },
      tabBarLabelStyle: { fontSize: 10, fontWeight: '700' },
    }}>
      <Tabs.Screen name="index" options={{ title: '학습 홈', tabBarIcon: ({ color }) => <TabIcon android="home" ios="house" color={color} /> }} />
      <Tabs.Screen name="course" options={{ title: '학습 과정', tabBarIcon: ({ color }) => <TabIcon android="menu_book" ios="book" color={color} /> }} />
      <Tabs.Screen name="review" options={{ title: '복습 노트', tabBarIcon: ({ color }) => <TabIcon android="favorite_border" ios="heart" color={color} /> }} />
      <Tabs.Screen name="settings" options={{ title: '내 정보', tabBarIcon: ({ color }) => <TabIcon android="person" ios="person" color={color} /> }} />
      <Tabs.Screen name="explore" options={{ href: null }} />
    </Tabs>
  );
}
