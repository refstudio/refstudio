import { ReferenceItem } from '../../types/ReferenceItem';

export function ReferencesList({
  references,
  onRefClicked,
}: {
  references: ReferenceItem[];
  onRefClicked: (item: ReferenceItem) => void;
}) {
  return (
    <div className="relative overflow-x-auto">
      <table className="w-full text-left text-gray-500 ">
        <thead className="bg-gray-50 text-gray-700 ">
          <tr>
            <th scope="col">key</th>
            <th scope="col">Title</th>
          </tr>
        </thead>
        <tbody>
          {references.map((reference) => (
            <tr
              className="cursor-pointer bg-white even:bg-slate-50 hover:bg-slate-200"
              key={reference.id}
              onClick={() => onRefClicked(reference)}
            >
              <td className="pr-2">{reference.citationKey}</td>
              <td className="py-2">
                <div className="whitespace-nowrap ">{reference.title}</div>
                <small>{reference.authors.map(({ fullName }) => fullName).join(', ')}</small>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
