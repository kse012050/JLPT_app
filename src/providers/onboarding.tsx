import { createContext, type ReactNode, useContext, useEffect, useState } from 'react';

import { getOnboardingComplete, setOnboardingComplete } from '@/storage/onboarding';

type OnboardingContextValue = {
  complete: boolean | null;
  finish: () => Promise<void>;
};

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [complete, setComplete] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;
    getOnboardingComplete()
      .then(value => { if (mounted) setComplete(value); })
      .catch(() => { if (mounted) setComplete(false); });
    return () => { mounted = false; };
  }, []);

  async function finish() {
    await setOnboardingComplete();
    setComplete(true);
  }

  return <OnboardingContext.Provider value={{ complete, finish }}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) throw new Error('OnboardingProvider가 필요합니다.');
  return context;
}
