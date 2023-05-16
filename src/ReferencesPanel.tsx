import { Panel } from 'react-resizable-panels';

export function ReferencesPanel({
  refClicked,
}: {
  refClicked?: (reference: string) => any;
}) {
  const refs = ['Ref 1', 'Ref 2', 'Ref 3', 'Ref 4'];
  return (
    <Panel defaultSize={20} style={{ padding: 10 }}>
      <h1>References</h1>
      <ul>
        {refs.map((ref) => (
          <li
            key={ref}
            style={{ marginBottom: 4, cursor: 'pointer' }}
            onClick={refClicked && refClicked(ref)}
          >
            {ref}
          </li>
        ))}
      </ul>
    </Panel>
  );
}
