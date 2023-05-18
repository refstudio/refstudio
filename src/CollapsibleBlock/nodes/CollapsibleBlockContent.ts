import { mergeAttributes, Node } from "@tiptap/core";

export const CollapsibleBlockContentNode = Node.create({
  name: "collapsibleContent",
  group: "block",
  content: "block*",

  parseHTML() {
    return [
      {
        tag: "p",
        priority: 200,
        node: "paragraph",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-content-type": this.name,
      }),
      ["p", 0],
    ];
  },
});