export function AIView({ selection }: { selection: string }) {
  return (
    <div>
      <h1>Selection</h1>
      <p className="my-4 italic">
        Select some text in the editor to see it here.
      </p>

      {selection && (
        <div className="border border-slate-100 bg-slate-50 p-4">
          {selection}
        </div>
      )}
    </div>
  );
}
