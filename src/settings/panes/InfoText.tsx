export function InfoText({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-txt-muted">{children}</p>;
}

export function InfoTextOptions({
  options,
  onClick,
}: {
  prefix?: React.ReactNode;
  options: { value: string; label: string }[];
  onClick: (value: string) => void;
}) {
  return (
    <>
      {options.map((option, i) => (
        <span key={option.value}>
          <output
            className="cursor-pointer border-b-[1px] border-dashed border-black/50 font-mono"
            onClick={() => onClick(option.value)}
          >
            {option.value}
          </output>{' '}
          for {option.label}
          {i < options.length - 2 ? ', ' : i < options.length - 1 ? ' or ' : ''}
        </span>
      ))}
    </>
  );
}
