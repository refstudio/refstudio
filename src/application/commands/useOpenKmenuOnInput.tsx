import { useKmenu } from 'kmenu';
import { useEffect } from 'react';

export function useOpenKmenuOnInput(key: string, indexToOpen: number) {
  const kmenu = useKmenu();

  useEffect(() => {
    if (kmenu.input === key) {
      kmenu.setOpen(indexToOpen, true);
    }
  }, [key, indexToOpen, kmenu]);

  return kmenu;
}
