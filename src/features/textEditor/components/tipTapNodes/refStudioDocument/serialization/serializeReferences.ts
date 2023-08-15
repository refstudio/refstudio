import { Author, ReferenceItem } from '../../../../../../types/ReferenceItem';

export interface SerializedReferences {
  textContent: string;
  extension: string;
}

/**
 * Serialize references into BibTex format
 *
 * @param references: References to serialize
 */
export function serializeReferences(references: ReferenceItem[]): SerializedReferences {
  return { textContent: references.map(serializeReference).join('\n'), extension: 'bib' };
}

function serializeAuthors(authors: Author[]): string {
  return authors.map((author) => author.fullName).join(' and ');
}

function serializeReference(reference: ReferenceItem): string {
  const lines = [`@ARTICLE{${reference.citationKey}`];

  lines.push(`\tTITLE = {${reference.title}}`);
  lines.push(`\tAUTHOR = {${serializeAuthors(reference.authors)}}`);

  if (reference.publishedDate) {
    const publishedDate = new Date(reference.publishedDate);
    lines.push(`\tYEAR = ${publishedDate.getUTCFullYear()}`);
    lines.push(`\tMONTH = ${publishedDate.getUTCMonth() + 1}`);
  }

  lines.push('}');

  return lines.join(',\n');
}
