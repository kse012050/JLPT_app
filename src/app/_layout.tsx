import { NotoSansJP_400Regular, NotoSansJP_700Bold } from '@expo-google-fonts/noto-sans-jp';
import { NotoSansKR_400Regular, NotoSansKR_500Medium, NotoSansKR_600SemiBold, NotoSansKR_700Bold } from '@expo-google-fonts/noto-sans-kr';
import { PlusJakartaSans_600SemiBold, PlusJakartaSans_700Bold } from '@expo-google-fonts/plus-jakarta-sans';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';

import { OnboardingProvider, useOnboarding } from '@/providers/onboarding';

function RootNavigator() {
  const { complete } = useOnboarding();
  const [fontsLoaded, fontError] = useFonts({
    NotoSansJP_400Regular, NotoSansJP_700Bold,
    NotoSansKR_400Regular, NotoSansKR_500Medium, NotoSansKR_600SemiBold, NotoSansKR_700Bold,
    PlusJakartaSans_600SemiBold, PlusJakartaSans_700Bold,
  });

  if (complete === null || (!fontsLoaded && !fontError)) return null;

  return <Stack screenOptions={{ headerShown: false }}>
    <Stack.Protected guard={!complete}>
      <Stack.Screen name="welcome" />
    </Stack.Protected>
    <Stack.Protected guard={complete}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="vocabulary" />
      <Stack.Screen name="login" options={{ presentation: 'modal' }} />
      <Stack.Screen name="onboarding-preview" />
    </Stack.Protected>
  </Stack>;
}

export default function RootLayout() {
  return <OnboardingProvider><RootNavigator /></OnboardingProvider>;
}
