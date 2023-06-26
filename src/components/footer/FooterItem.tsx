import React from 'react';

export function FooterItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <span className="flex cursor-pointer items-center gap-2 px-2 py-1 hover:bg-slate-700">
      {icon} <span>{text}</span>
    </span>
  );
}
