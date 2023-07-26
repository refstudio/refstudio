export const defaultCollapsibleBlock = `
<notionblock type='collapsible'>
    <p>Header</p>
    <notionblock>
        <p>Content Line 1</p>
    </notionblock>
    <notionblock>
        <p>Content Line 2</p>
    </notionblock>
</notionblock>`;

export const defaultUncollapsedCollapsibleBlock = `
<notionblock type='collapsible' collapsed='false'>
    <p>Header</p>
    <notionblock>
        <p>Content Line 1</p>
    </notionblock>
    <notionblock>
        <p>Content Line 2</p>
    </notionblock>
</notionblock>`;

export const defaultCollapsibleBlockWithCursor = `
<notionblock type='collapsible'>
    <p>|Header</p>
    <notionblock>
        <p>Content Line 1</p>
    </notionblock>
    <notionblock>
        <p>Content Line 2</p>
    </notionblock>
</notionblock>`;

export const defaultParagraph = `<p>Some content</p>`;

export const oneLineCollapsibleBlock = `
<notionblock type='collapsible'>
    <p>|Header</p>
    <notionblock>
        <p>Content Line 1</p>
    </notionblock>
</notionblock>`;
