import { ReferenceItem } from '../../types/ReferenceItem';

/**
 * Defines the rules to apply to filter references in the selector
 * @param query string query to filter on
 * @returns the filter function
 */
export function getReferenceFilter(query: string) {
  return (referenceItem: ReferenceItem) =>
    referenceItem.title.toLowerCase().includes(query.toLowerCase()) ||
    referenceItem.authors.some(({ fullName }) => fullName.toLowerCase().includes(query));
}
