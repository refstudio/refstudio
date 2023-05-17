import { ReferenceItem } from './types/ReferenceItem';

export function Reference({ ref }: { ref?: ReferenceItem }) {
  if (!ref) return <span>-</span>;
  return <span>[{ref.id}]</span>;
}
