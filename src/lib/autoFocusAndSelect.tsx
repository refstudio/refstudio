export function autoFocusAndSelect(input: HTMLInputElement | null) {
  input?.focus();
  input?.select();
}
