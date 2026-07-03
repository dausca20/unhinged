import { Tabs } from 'expo-router';
import { BottomTabBar } from '@/components';

export default function TabsLayout() {
  // Order here defines tab order: Drop · Likes · Messages · Profile.
  return (
    <Tabs tabBar={(props) => <BottomTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="weekly-drop" />
      <Tabs.Screen name="likes" />
      <Tabs.Screen name="matches" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
