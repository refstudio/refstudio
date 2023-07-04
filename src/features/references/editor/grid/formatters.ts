import { ReferenceItem } from '../../../../types/ReferenceItem';

export function firstAuthorFormatter({ value }: { value: ReferenceItem['authors'] }) {
  const [author = undefined] = value;
  return author?.fullName ?? '';
}
export function authorsFormatter({ value }: { value: ReferenceItem['authors'] }) {
  return value.map((a) => a.fullName.split(' ').pop()).join(', ');
}
