import { atom } from 'jotai';

const LOCAL_STORAGE_KEY = 'welcome-tip-dismissed';

function getInitialValue() {
  const item = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (item !== null) {
    return JSON.parse(item) as boolean;
  }
  return false;
}

const localStorageWelcomeTipDismissedAtom = atom(getInitialValue());

export const welcomeTipDismissedAtom = atom(
  (get) => get(localStorageWelcomeTipDismissedAtom),
  (_, set, newValue: boolean) => {
    set(localStorageWelcomeTipDismissedAtom, newValue);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newValue));
  },
);
