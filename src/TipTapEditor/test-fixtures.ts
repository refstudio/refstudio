export const defaultCollapsibleBlock = `
<collapsible-block>
    <collapsible-summary>Header</collapsible-summary>
    <collapsible-content>
        <p>Content Line 1</p>
        <p>Content Line 2</p>
    </collapsible-content>
</collapsible-block>`;

export const oneLineCollapsibleBlock = `
<collapsible-block>
    <collapsible-summary>Header</collapsible-summary>
    <collapsible-content>
        <p>Content Line</p>
    </collapsible-content>
</collapsible-block>`;

export const collapsedEmptyCollapsibleBlock = `
<collapsible-block folded='true'>
    <collapsible-summary></collapsible-summary>
</collapsible-block>`;

export const uncollapsedCollapsibleBlockWithEmptyContent = `
<collapsible-block folded='false'>
    <collapsible-summary></collapsible-summary>
    <collapsible-content>
        <p></p>
    </collapsible-content>
</collapsible-block>
`;
