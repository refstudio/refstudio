import React from 'react';

import { Footer } from '../components/footer/Footer';

export function ApplicationFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen flex-col">
      {children}
      <Footer />
    </div>
  );
}
