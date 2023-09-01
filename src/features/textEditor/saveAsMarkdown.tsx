import { getFileNameAndExtension, makeExportsPath, writeFileContent } from '../../io/filesystem';
import { notifyWarning } from '../../notifications/notifications';
import { MarkdownSerializer } from './components/tipTapNodes/refStudioDocument/serialization/MarkdownSerializer';

export async function saveAsMarkdown(markdownSerializer: MarkdownSerializer, filePath: string) {
  try {
    const { name: fileName } = getFileNameAndExtension(filePath);
    if (!fileName) {
      notifyWarning('Could not save markdown file');
      return;
    }

    const markdownFileName = `${fileName}.md`;
    const markdownFilePath = makeExportsPath(markdownFileName);
    const serializedContent = markdownSerializer.serialize(fileName);
    await writeFileContent(markdownFilePath, serializedContent.markdownContent);

    if (serializedContent.bibliography) {
      const bibliographyFileName = `${fileName}.${serializedContent.bibliography.extension}`;
      const bibliographyFilePath = makeExportsPath(bibliographyFileName);
      await writeFileContent(bibliographyFilePath, serializedContent.bibliography.textContent);
    }
  } catch (err) {
    console.error('Error', err);
  }
}
