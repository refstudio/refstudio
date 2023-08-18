import { cx } from '../../../lib/cx';
import { IconProps, IconType } from '../type';

export const FilesIcon: IconType = ({ className, ...props }: IconProps) =>
  <div className={cx('flex w-10 h-10 justify-center content-center gap-2 rounded', className)} {...props}>
    <div className='flex w-6 h-6 justify-center content-center shrink-0 self-center'>
      <svg className='self-center' fill="none" height="18" viewBox="0 0 20 18" width="20" xmlns="http://www.w3.org/2000/svg">
        <path clipRule="evenodd" d="M17 18H3C1.874 18 1.074 17.509 0.588 16.834C0.210232 16.2966 0.00512901 15.6569 0 15V3C0 2.20435 0.316071 1.44129 0.87868 0.87868C1.44129 0.316071 2.20435 0 3 0H13C13.7956 0 14.5587 0.316071 15.1213 0.87868C15.6839 1.44129 16 2.20435 16 3V8H19C19.2652 8 19.5196 8.10536 19.7071 8.29289C19.8946 8.48043 20 8.73478 20 9V15C20 15.493 19.86 16.211 19.412 16.834C18.925 17.51 18.125 18 17 18ZM18 11C18 10.7348 17.8946 10.4804 17.7071 10.2929C17.5196 10.1054 17.2652 10 17 10C16.7348 10 16.4804 10.1054 16.2929 10.2929C16.1054 10.4804 16 10.7348 16 11V15C16 15.2652 16.1054 15.5196 16.2929 15.7071C16.4804 15.8946 16.7348 16 17 16C17.2652 16 17.5196 15.8946 17.7071 15.7071C17.8946 15.5196 18 15.2652 18 15V11Z" fill="#828991" fillRule="evenodd" />
      </svg>
    </div >
  </div>;