export function autoFocusAndSelect(input: HTMLInputElement | HTMLTextAreaElement | null) {
  input?.focus();
  input?.select();
}

export function autoFocus(input: HTMLInputElement | HTMLTextAreaElement | null) {
  input?.focus();
}

export function autoFocusAndSelectWithSelectionRange(start: number, end: number) {
  return (input: HTMLInputElement | null) => {
    input?.focus();
    input?.setSelectionRange(start, end);
  };
}
