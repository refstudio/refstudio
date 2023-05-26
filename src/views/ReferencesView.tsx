import { ReferenceItem } from '../types/ReferenceItem';

export function ReferencesView({ onRefClicked }: { onRefClicked?: (item: ReferenceItem) => void }) {
  return (
    <div className="flex h-full w-full flex-1 flex-col overflow-scroll px-2 pt-2">
      <div className="mb-2 flex flex-col text-sm font-bold uppercase">Library</div>
      <ul className="space-y-2">
        {REFS_DATABASE.map((reference) => (
          <li
            key={reference.id}
            className="mb-0 cursor-pointer p-1 hover:bg-slate-200"
            onClick={() => onRefClicked && onRefClicked(reference)}
          >
            <strong>{reference.id}</strong> - {reference.title}
            <br />
            <small>
              <em>
                {reference.author}, {reference.year} by {reference.publisher}
              </em>
            </small>
          </li>
        ))}
      </ul>
      <p className="my-4 text-sm italic">Click on a reference to add it to the document.</p>
    </div>
  );
}

const REFS_DATABASE: ReferenceItem[] = [
  {
    id: 'ref1',
    title: 'Artificial Intelligence: A Modern Approach',
    author: 'Stuart Russell, Peter Norvig',
    year: 2016,
    publisher: 'Pearson',
  },
  {
    id: 'ref2',
    title: 'Deep Learning',
    author: 'Ian Goodfellow, Yoshua Bengio, Aaron Courville',
    year: 2016,
    publisher: 'MIT Press',
  },
  {
    id: 'ref3',
    title: 'Machine Learning: A Probabilistic Perspective',
    author: 'Kevin P. Murphy',
    year: 2012,
    publisher: 'MIT Press',
  },
  {
    id: 'ref4',
    title: 'Pattern Recognition and Machine Learning',
    author: 'Christopher M. Bishop',
    year: 2006,
    publisher: 'Springer',
  },
  {
    id: 'ref5',
    title: 'Reinforcement Learning: An Introduction',
    author: 'Richard S. Sutton, Andrew G. Barto',
    year: 2018,
    publisher: 'MIT Press',
  },
];
