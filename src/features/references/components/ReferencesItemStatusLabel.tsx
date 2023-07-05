import { assertNever } from '../../../lib/assertNever';
import { ReferenceItemStatus } from '../../../types/ReferenceItem';

export function ReferencesItemStatusLabel({ status }: { status: ReferenceItemStatus }) {
  switch (status) {
    case 'processing':
      return (
        <span className="rounded-md border border-orange-400 bg-white/60 px-1 py-0.5 uppercase text-orange-400">
          processing
        </span>
      );
    case 'failure':
      return (
        <span className="rounded-md border border-red-400 bg-white/60 px-1 py-0.5 uppercase text-red-400">failure</span>
      );
    case 'complete':
      return (
        <span className="rounded-md border border-green-400 bg-white/60 px-1 py-0.5 uppercase text-green-400">
          complete
        </span>
      );
    default:
      assertNever(status);
      return null;
  }
}
