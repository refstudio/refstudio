export function ReferencesView({
  onRefClicked,
}: {
  onRefClicked?: (reference: string) => any;
}) {
  const refs = ['Ref 1', 'Ref 2', 'Ref 3', 'Ref 4'];
  return (
    <div>
      <h1>References</h1>
      <ul>
        {refs.map((ref) => (
          <li
            key={ref}
            style={{ marginBottom: 4, cursor: 'pointer' }}
            onClick={() => onRefClicked && onRefClicked(ref)}
          >
            {ref}
          </li>
        ))}
      </ul>
    </div>
  );
}
