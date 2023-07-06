export function autoFocusAndSelect(input: HTMLInputElement | HTMLTextAreaElement | null) {
  input?.focus();
  input?.select();
}

export function autoFocus(input: HTMLInputElement | HTMLTextAreaElement | null) {
  input?.focus();
}
