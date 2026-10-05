import Storage from 'expo-sqlite/kv-store';

const ONBOARDING_KEY = 'onboarding.complete.v1';

export async function getOnboardingComplete() {
  return (await Storage.getItem(ONBOARDING_KEY)) === 'true';
}

export async function setOnboardingComplete() {
  await Storage.setItem(ONBOARDING_KEY, 'true');
}
