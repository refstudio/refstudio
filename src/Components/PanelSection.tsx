import React, { useState } from 'react';
import { VscChevronDown, VscChevronRight } from 'react-icons/vsc';

export function PanelSection({ title, children }: { title: string; children: React.ReactNode }) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="flex flex-col overflow-scroll px-2 pt-2">
      <div
        className="mb-2 flex cursor-pointer flex-row items-center gap-1 text-sm font-bold uppercase"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded && <VscChevronDown />}
        {!expanded && <VscChevronRight />}
        {title}
      </div>
      {expanded && <div className="h-full overflow-scroll">{children}</div>}
    </div>
  );
}
