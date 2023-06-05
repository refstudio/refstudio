export function Label({ off = false, text }: { off?: boolean; text: string }) {
  if (off) {
    return <span />;
  }

  return <span>{text}</span>;
}
