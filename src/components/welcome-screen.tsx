import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useOnboarding } from '@/providers/onboarding';

const font = {
  regular: 'NotoSansKR_400Regular',
  medium: 'NotoSansKR_500Medium',
  semibold: 'NotoSansKR_600SemiBold',
  bold: 'NotoSansKR_700Bold',
};

function SocialButton({ brand, label, style }: { brand: string; label: string; style: 'kakao' | 'naver' | 'google' }) {
  return <View style={[styles.socialButton, style === 'kakao' && styles.kakaoButton, style === 'naver' && styles.naverButton, style === 'google' && styles.googleButton]} accessibilityRole="button" accessibilityState={{ disabled: true }} accessibilityLabel={`${label}, 로그인 연결 준비 중`}>
    <Text style={[styles.socialIcon, style === 'naver' && styles.naverIcon, style === 'google' && styles.googleIcon]}>{brand}</Text>
    <Text style={[styles.socialText, style === 'naver' && styles.naverText]}>{label}</Text>
  </View>;
}

export function WelcomeScreen({ fromSettings = false, preview = false }: { fromSettings?: boolean; preview?: boolean }) {
  const { finish } = useOnboarding();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function continueWithoutLogin() {
    if (fromSettings) {
      router.back();
      return;
    }
    if (preview) {
      router.replace('/');
      return;
    }

    setSaving(true);
    setError('');
    try {
      await finish();
    } catch {
      setError('선택을 저장하지 못했습니다. 다시 시도해 주세요.');
      setSaving(false);
    }
  }

  return <LinearGradient colors={['#FFF9F8', '#FFFCF9', '#FFF8F8']} style={styles.background}>
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.hero}>
            {fromSettings ? <Pressable onPress={() => router.back()} style={styles.backButton} accessibilityRole="button" accessibilityLabel="설정으로 돌아가기"><Text style={styles.backText}>‹  설정으로 돌아가기</Text></Pressable> : null}
            <View style={styles.logoRing}><Text style={styles.logoFlower}>✿</Text><View style={styles.logoBadge}><Text style={styles.logoBadgeText}>N5–N1</Text></View></View>
            <View style={styles.goalBadge}><Text style={styles.goalBadgeText}>✦  일본어 첫걸음부터 JLPT까지</Text></View>
            <Text style={styles.title}>JLPT 완주</Text>
            <Text style={styles.headline}>초보자도 0부터 시작하는 일본어 JLPT 마스터 플랜</Text>
            <Text style={styles.subline}>한글로 가장 쉽게 이해하는 일본어 시험 완주 가이드</Text>
          </View>

          <View style={styles.actions}>
            <Text style={styles.loginNotice}>간편 로그인 연결 준비 중</Text>
            <SocialButton brand="●" label="카카오로 3초 만에 시작하기" style="kakao" />
            <SocialButton brand="N" label="네이버로 계속하기" style="naver" />
            <SocialButton brand="G" label="Google 계정으로 계속하기" style="google" />
            <Pressable onPress={() => { void continueWithoutLogin(); }} disabled={saving} style={styles.guestButton} accessibilityRole="button" accessibilityLabel={fromSettings ? '설정으로 돌아가기' : '로그인 없이 바로 체험하기'}>
              <Text style={styles.guestText}>{fromSettings ? '설정으로 돌아가기' : '로그인 없이 바로 체험하기'}  →</Text>
            </Pressable>
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Text style={styles.footnote}>{fromSettings ? '계정 로그인은 서버 연결 후 이 화면에서 사용할 수 있습니다.' : '지금은 로그인 없이 시작하고, 계정 연결은 나중에 설정에서 할 수 있어요.'}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  </LinearGradient>;
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  safe: { flex: 1 },
  page: { flexGrow: 1, alignItems: 'center' },
  content: { width: '100%', maxWidth: 440, minHeight: 620, flex: 1, paddingHorizontal: 24, paddingTop: 38, paddingBottom: 22 },
  hero: { alignItems: 'center' },
  backButton: { alignSelf: 'flex-start', paddingVertical: 8, marginBottom: 10 },
  backText: { color: '#A31943', fontSize: 13, fontFamily: font.semibold },
  logoRing: { width: 94, height: 94, borderRadius: 47, borderWidth: 2, borderColor: '#F2B9C7', backgroundColor: '#FFF6F8', alignItems: 'center', justifyContent: 'center', marginBottom: 19 },
  logoFlower: { color: '#B90538', fontSize: 49, lineHeight: 61, fontFamily: font.bold },
  logoBadge: { position: 'absolute', right: -2, bottom: -4, backgroundColor: '#B90538', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3 },
  logoBadgeText: { color: '#FFFFFF', fontSize: 9, fontFamily: font.bold },
  goalBadge: { backgroundColor: '#FFF1F3', borderWidth: 1, borderColor: '#E8C5CC', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 5 },
  goalBadgeText: { color: '#A31943', fontSize: 10, fontFamily: font.bold },
  title: { marginTop: 14, color: '#B90538', fontSize: 30, lineHeight: 41, fontFamily: font.bold, textAlign: 'center' },
  headline: { marginTop: 4, color: '#A31943', fontSize: 13, lineHeight: 21, fontFamily: font.bold, textAlign: 'center' },
  subline: { marginTop: 11, color: '#75696B', fontSize: 12, lineHeight: 19, fontFamily: font.regular, textAlign: 'center' },
  actions: { marginTop: 'auto', gap: 11, paddingTop: 40 },
  loginNotice: { color: '#8B777C', fontSize: 11, fontFamily: font.medium, textAlign: 'center', marginBottom: 1 },
  socialButton: { minHeight: 54, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 15, opacity: 0.6 },
  kakaoButton: { backgroundColor: '#FEE500' },
  naverButton: { backgroundColor: '#03C75A' },
  googleButton: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#DCDADD' },
  socialIcon: { position: 'absolute', left: 20, color: '#292929', fontSize: 19, fontFamily: font.bold },
  naverIcon: { color: '#FFFFFF' },
  googleIcon: { color: '#4285F4' },
  socialText: { color: '#242024', fontSize: 14, fontFamily: font.bold },
  naverText: { color: '#FFFFFF' },
  guestButton: { minHeight: 54, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  guestText: { color: '#B90538', fontSize: 14, fontFamily: font.bold },
  error: { color: '#B42318', fontSize: 12, fontFamily: font.medium, textAlign: 'center' },
  footnote: { marginTop: 17, color: '#8A8082', fontSize: 10, lineHeight: 17, fontFamily: font.regular, textAlign: 'center' },
});
