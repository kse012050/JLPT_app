const ONBOARDING_KEY = 'onboarding.complete.v1';

export async function getOnboardingComplete() {
  try {
    return window.localStorage.getItem(ONBOARDING_KEY) === 'true';
  } catch {
    return false;
  }
}

export async function setOnboardingComplete() {
  window.localStorage.setItem(ONBOARDING_KEY, 'true');
}
