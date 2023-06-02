
import { useAtomValue } from 'jotai';

import { getReferencesAtom, isPdfIngestionRunningAtom } from '../atoms/referencesState';
import { Spinner } from '../components/Spinner';
import { ReferenceItem } from '../types/ReferenceItem';

interface ReferencesViewProps {
  onRefClicked: (item: ReferenceItem) => void;
}

export function ReferencesView({ onRefClicked }: ReferencesViewProps) {
  const references = useAtomValue(getReferencesAtom);
  const isPdfIngestionLoading = useAtomValue(isPdfIngestionRunningAtom);

  return (
    <div className="flex h-full w-full flex-col">
      <h1>References</h1>
      <div className="flex-1 overflow-scroll flex flex-col">
        <p className="my-4 italic">Click on a reference to add it to the document.</p>

        <ul className="divide-y-2 border">
          {references.map((reference) => (
            <li
              className="mb-0 cursor-pointer p-1 hover:bg-slate-100 overflow-x-hidden text-ellipsis"
              key={reference.id}
              onClick={() => onRefClicked(reference)}
            >
              <strong>{reference.title}</strong>
              <br />
              <small>
                <em className="whitespace-nowrap">
                  {reference.authors.map(({ fullName }) => fullName).join(', ')}
                </em>
              </small>
            </li>
          ))}
        </ul>
        {isPdfIngestionLoading && <Spinner />}
      </div>
    </div>
  );
}
