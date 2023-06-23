import { Box, Flex, Icon, theme } from '@chakra-ui/react';
import { IconType } from 'react-icons';

export interface RightAction {
  title?: string;
  onClick: (evt: React.MouseEvent) => void;
  VscIcon: IconType;
}

interface FileNodeProps {
  bold?: boolean;
  fileName: string;
  onClick: () => void;
  paddingLeft?: string;
  rightAction?: RightAction;
  selected?: boolean;
  VscIcon: IconType;
}

export function FileNode({ bold, fileName, onClick, paddingLeft, rightAction, selected, VscIcon }: FileNodeProps) {
  return (
    <Box
      _hover={selected ? {} : { bgColor: theme.colors.gray[100] }}
      bgColor={selected ? theme.colors.gray[200] : theme.colors.white}
      cursor="pointer"
      h={theme.space[7]}
      paddingLeft={paddingLeft}
      role="group"
      userSelect="none"
      onClick={onClick}
    >
      <Flex alignItems="center" gap={1} h="100%">
        <Icon as={VscIcon} />
        <Box flex={1} fontWeight={bold ? theme.fontWeights.semibold : theme.fontWeights.normal} isTruncated>
          {fileName}
        </Box>
        {rightAction && (
          <Icon
            _groupHover={{ display: 'block' }}
            _hover={{ bg: theme.colors.gray[300] }}
            as={rightAction.VscIcon}
            display="none"
            h={6}
            marginRight={theme.space[2]}
            padding={theme.space['0.5']}
            rounded={theme.radii.md}
            title={rightAction.title}
            w={6}
            onClick={rightAction.onClick}
          />
        )}
      </Flex>
    </Box>
  );
}
