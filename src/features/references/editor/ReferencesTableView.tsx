import './ReferenceView.css';

import { useAtomValue } from 'jotai';

import { getReferencesAtom } from '../../../atoms/referencesState';
import { UploadTipInstructions } from '../components/UploadTipInstructions';

export function ReferencesTableView() {
  const references = useAtomValue(getReferencesAtom);

  return (
    <div className="w-full overflow-y-auto p-6">
      {references.length === 0 && <UploadTipInstructions />}
      <table className="w-full border border-slate-300 text-left text-gray-500 ">
        <thead>
          <tr className="h-10 bg-slate-300 text-black">
            <th scope="col">Citation Key</th>
            <th scope="col">Title</th>
            <th scope="col">Date</th>
            <th scope="col">Authors</th>
          </tr>
        </thead>
        <tbody>
          {references.map((reference) => (
            <tr className="cursor-pointer bg-white even:bg-slate-50 hover:bg-slate-200" key={reference.id}>
              <td className="px-2">{reference.citationKey}</td>
              <td className="py-2">
                <div className="whitespace-nowrap ">{reference.title}</div>
              </td>
              <td>{reference.publishedDate ?? 'N/A'}</td>
              <td className="py-2 pl-6">
                <ul className="list-disc">
                  {reference.authors.map(({ fullName }) => (
                    <li key={fullName}>{fullName}</li>
                  ))}
                </ul>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
