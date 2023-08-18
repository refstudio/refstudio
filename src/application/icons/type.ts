export interface IconProps extends React.HTMLAttributes<HTMLElement> {
  active?: boolean;
}

export type IconType = (props: IconProps) => React.ReactElement;
