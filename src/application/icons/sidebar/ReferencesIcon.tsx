import '../Icons.css';

import { cx } from '../../../lib/cx';
import { IconProps, IconType } from '../type';

export const ReferencesIcon: IconType = ({ active, ...props }: IconProps) =>
  <div className={cx('icon', { 'cursor-pointer': !!props.onClick, active })} {...props}>
    <div className='flex w-6 h-6 justify-center content-center shrink-0 self-center'>
      <svg className='self-center' fill="none" height="20" viewBox="0 0 16 20" width="16" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 4H3C2.73478 4 2.48043 3.89464 2.29289 3.70711C2.10536 3.51957 2 3.26522 2 3C2 2.73478 2.10536 2.48043 2.29289 2.29289C2.48043 2.10536 2.73478 2 3 2H14V1C14 0.734784 13.8946 0.48043 13.7071 0.292893C13.5196 0.105357 13.2652 0 13 0L2 0C1.46957 0 0.960859 0.210714 0.585786 0.585786C0.210714 0.960859 0 1.46957 0 2V18C0 19.1 0.9 20 2 20H14C14.5304 20 15.0391 19.7893 15.4142 19.4142C15.7893 19.0391 16 18.5304 16 18V5C16 4.73478 15.8946 4.48043 15.7071 4.29289C15.5196 4.10536 15.2652 4 15 4H8V12L6 10L4 12V4Z" fill="#828991" />
      </svg>
    </div>
  </div>;