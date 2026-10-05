import { Tabs } from 'expo-router';
import { SymbolView, type AndroidSymbol, type SFSymbol } from 'expo-symbols';
import { type ColorValue, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function TabIcon({ android, ios, color }: { android: AndroidSymbol; ios: SFSymbol; color: ColorValue }) {
  return <SymbolView name={{ android, web: android, ios }} tintColor={color} size={22} />;
}

export default function TabLayout() {
  const { width } = useWindowDimensions();
  const { bottom } = useSafeAreaInsets();
  const tabBottomPadding = Math.max(bottom, 8);
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: '#F43F5E',
      tabBarInactiveTintColor: '#554245',
      tabBarStyle: width >= 700 ? { display: 'none' } : { backgroundColor: '#FFFFFF', borderTopColor: '#E7D9DA', height: 68 + tabBottomPadding, paddingTop: 6, paddingBottom: tabBottomPadding },
      tabBarItemStyle: { marginHorizontal: 5, marginVertical: 2 },
      tabBarLabelStyle: { fontFamily: 'NotoSansKR_600SemiBold', fontSize: 11, lineHeight: 16, includeFontPadding: false },
    }}>
      <Tabs.Screen name="index" options={{ title: '오늘의 공부', tabBarIcon: ({ color }) => <TabIcon android="calendar_today" ios="calendar" color={color} /> }} />
      <Tabs.Screen name="course" options={{ title: '학습 과정', tabBarIcon: ({ color }) => <TabIcon android="menu_book" ios="book" color={color} /> }} />
      <Tabs.Screen name="review" options={{ title: '복습 노트', tabBarIcon: ({ color }) => <TabIcon android="edit_note" ios="square.and.pencil" color={color} /> }} />
      <Tabs.Screen name="settings" options={{ title: '설정', tabBarIcon: ({ color }) => <TabIcon android="settings" ios="gearshape" color={color} /> }} />
      <Tabs.Screen name="explore" options={{ href: null }} />
    </Tabs>
  );
}
