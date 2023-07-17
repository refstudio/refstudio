import { NodeViewWrapper } from '@tiptap/react';
import { atom, useAtomValue } from 'jotai';
import { useMemo } from 'react';

import { getDerivedReferenceAtom } from '../../../../../atoms/referencesState';

interface ReferenceProps {
  node?: {
    attrs?: {
      id?: string;
    };
  };
}

export function Reference({ node }: ReferenceProps) {
  const referenceAtom = useMemo(() => {
    if (node?.attrs?.id) {
      return getDerivedReferenceAtom(node.attrs.id);
    }
    return atom(undefined);
  }, [node?.attrs?.id]);
  const reference = useAtomValue(referenceAtom);

  return (
    <NodeViewWrapper as="span">
      {reference?.citationKey ? `@${reference.citationKey}` : 'INVALID REFERENCE'}
    </NodeViewWrapper>
  );
}
