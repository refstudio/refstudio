export const INITIAL_CONTENT = JSON.stringify({
  type: 'doc',
  content: [
    {
      type: 'notionBlock',
      attrs: { type: null, collapsed: false },
      content: [{ type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Hi there,' }] }],
    },
    {
      type: 'notionBlock',
      attrs: { type: null, collapsed: false },
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'this is a ' },
            { type: 'text', marks: [{ type: 'italic' }], text: 'basic' },
            { type: 'text', text: ' example of ' },
            { type: 'text', marks: [{ type: 'bold' }], text: 'tiptap' },
            {
              type: 'text',
              text: '. Sure, there are all kind of basic text styles you’d probably expect from a text editor. But wait until you see the lists:',
            },
          ],
        },
      ],
    },
    {
      type: 'notionBlock',
      attrs: { type: 'collapsible', collapsed: false },
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: 'Open Collapsible' }] },
        {
          type: 'notionBlock',
          attrs: { type: null, collapsed: false },
          content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Text' }] }],
        },
        {
          type: 'notionBlock',
          attrs: { type: 'collapsible', collapsed: true },
          content: [{ type: 'paragraph', content: [{ type: 'text', text: 'collapsible 1.2' }] }],
        },
      ],
    },
    {
      type: 'notionBlock',
      attrs: { type: 'bulletList', collapsed: false },
      content: [{ type: 'paragraph', content: [{ type: 'text', text: 'That’s a bullet list with one …' }] }],
    },
    {
      type: 'notionBlock',
      attrs: { type: 'bulletList', collapsed: false },
      content: [{ type: 'paragraph', content: [{ type: 'text', text: '… or two list items.' }] }],
    },
    {
      type: 'notionBlock',
      attrs: { type: 'collapsible', collapsed: true },
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: 'Closed Collapsible' }] },
        {
          type: 'notionBlock',
          attrs: { type: null, collapsed: false },
          content: [{ type: 'paragraph', content: [{ type: 'text', text: 'collapsible 2.1' }] }],
        },
      ],
    },
    {
      type: 'notionBlock',
      attrs: { type: null, collapsed: false },
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Isn’t that great? And all of that is editable. But wait, there’s more. Let’s try a code block:',
            },
          ],
        },
      ],
    },
    {
      type: 'notionBlock',
      attrs: { type: null, collapsed: false },
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'I know, I know, this is impressive. It’s only the tip of the iceberg though. Give it a try and click a little bit around. Don’t forget to check the other examples too.',
            },
          ],
        },
      ],
    },
    {
      type: 'notionBlock',
      attrs: { type: null, collapsed: false },
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Wow, that’s amazing. Good work, boy! 👏 ' },
            { type: 'hardBreak' },
            { type: 'text', text: '— Mom' },
          ],
        },
      ],
    },
  ],
});

export const FILE2_CONTENT = JSON.stringify({
  type: 'doc',
  content: [
    {
      type: 'notionBlock',
      attrs: { type: null, collapsed: false },
      content: [{ type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Lorem Buzzword' }] }],
    },
    {
      type: 'notionBlock',
      attrs: { type: null, collapsed: false },
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: "We will regenerate our aptitude to evolve without decreasing our power to syndicate. Without development, you will lack cross-media CAE. A company that can streamline elegantly will (at some unspecified point in the future) be able to orchestrate correctly. The capacity to enable perfectly leads to the capacity to harness without devaluing our power to deliver. Do you have a infinitely reconfigurable scheme for coping with emerging methodologies? Is it more important for something to be dynamic or to be dynamic or to be leading-edge or to be dynamic or to be leading-edge or to be dynamic or to be best-of-breed? The portals factor can be delivered as-a-service to wherever it’s intended to go – mobile. It may seem mixed-up, but it's 100 percent true! Your budget for innovating should be at least one-half of your budget for innovating should be at least one-half of your budget for innovating should be at least one-half of your budget for innovating should be at least one-half of your budget for engaging should be at least one-half of your budget for harnessing. Our feature set is second to none, but our vertical, customized efficient, user-centric TQM and non-complex use is invariably considered a remarkable achievement.",
            },
          ],
        },
      ],
    },
    {
      type: 'notionBlock',
      attrs: { type: null, collapsed: false },
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: "Without niches, you will lack affiliate-based compliance. A company that can synthesize courageously will (eventually) be able to engineer virtually than to strategize macro-intuitively. Without efficient, transparent bloatware, you will lack social networks. If all of this sounds astonishing to you, that's because it is! Quick: do you have a infinitely reconfigurable scheme for coping with emerging methodologies? Is it more important for something to be dynamic or to be customer-directed? What does the buzzword 'technologies' really mean? Think virally-distributed. Our functionality is unparalleled, but our C2C2C paradigms and easy use is usually considered a terrific achievement. We think that most C2C2C web-based applications use far too much Python, and not enough Java. Have you ever been unable to disintermediate your feature set? Free? We apply the proverb 'A rolling stone gathers no moss' not only to our power to repurpose. Our functionality is unparalleled, but our power to deliver. That is a remarkable achievement taking into account this month's financial state of things! If all of this comes off as mixed-up to you, that's because it is! What does the buzzword 'technologies' really mean? Think virally-distributed. Quick: do you have a infinitely reconfigurable scheme for coping with emerging methodologies? Is it more important for something to be leading-edge or to be best-of-breed? The portals factor can be summed up in one word: affiliate-based.",
            },
          ],
        },
      ],
    },
  ],
});

export const FILE3_CONTENT = JSON.stringify({
  type: 'doc',
  content: [
    {
      type: 'notionBlock',
      attrs: { type: null, collapsed: false },
      content: [{ type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Rewrite' }] }],
    },
    {
      type: 'notionBlock',
      attrs: { type: null, collapsed: false },
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: "In the cycling world, power meters are the typical way to objectively measure performance. Your speed is dependent on a lot of factors, like wind, road surface, and elevation. One's heart rate is largely a function of genetics, but also things like temperature. The amount of power you are outputting to the pedals though, is a direct measure of how much work you're doing, regardless of wind, elevation, your body weight, etc.",
            },
          ],
        },
      ],
    },
  ],
});
