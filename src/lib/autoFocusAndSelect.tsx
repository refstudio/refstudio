export function autoFocusAndSelect(input: HTMLInputElement | null) {
  input?.focus();
  input?.select();
}

export function autoFocusAndSelectWithSelectionRange(start: number, end: number) {
  return (input: HTMLInputElement | null) => {
    input?.focus();
    input?.setSelectionRange(start, end);
  };
}
