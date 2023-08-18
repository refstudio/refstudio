import './Icons.css';

import { cx } from '../../../lib/cx';
import { IconProps } from './type';


export function IconWrapper({ active, children, ...props }: IconProps & { children: React.ReactNode }) {
  return <div className={cx('icon', { 'cursor-pointer': !!props.onClick, active })} {...props}>
    {children}
  </div>;
}