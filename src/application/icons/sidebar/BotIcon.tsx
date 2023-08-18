import { cx } from '../../../lib/cx';
import { IconProps, IconType } from '../type';

export const BotIcon: IconType = ({ className, ...props }: IconProps) =>
  <div className={cx('flex w-10 h-10 justify-center content-center gap-2 rounded', className)} {...props}>
    <svg className='self-center' fill="none" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
      <path d="M21.8971 9.82502V5.53971C21.8971 4.95394 21.6653 4.39217 21.2528 3.97798C20.8403 3.56378 20.2808 3.33109 19.6974 3.33109H13.0983V2.88224C13.4338 2.57966 13.6482 2.14456 13.6482 1.65646C13.6482 1.21714 13.4744 0.795813 13.165 0.485166C12.8556 0.174519 12.436 0 11.9985 0C11.5609 0 11.1413 0.174519 10.8319 0.485166C10.5225 0.795813 10.3487 1.21714 10.3487 1.65646C10.3487 2.14456 10.5632 2.57966 10.8986 2.88224V3.33109H4.29954C3.71615 3.33109 3.15664 3.56378 2.74412 3.97798C2.3316 4.39217 2.09985 4.95394 2.09985 5.53971V9.85042L2.02066 9.85594C1.74337 9.87578 1.48388 10.0004 1.29448 10.2047C1.10508 10.409 0.999854 10.6778 1 10.9569V13.1655C1 13.4584 1.11588 13.7393 1.32214 13.9464C1.5284 14.1535 1.80815 14.2699 2.09985 14.2699V19.7914C2.09985 20.3771 2.3316 20.9389 2.74412 21.3531C3.15664 21.7673 3.71615 22 4.29954 22H19.6974C20.2808 22 20.8403 21.7673 21.2528 21.3531C21.6653 20.9389 21.8971 20.3771 21.8971 19.7914V14.2699C22.1888 14.2699 22.4685 14.1535 22.6748 13.9464C22.8811 13.7393 22.9969 13.4584 22.9969 13.1655V11.0254C23.0097 10.854 22.9826 10.682 22.9177 10.5229C22.6956 9.98404 22.2193 9.85483 21.8971 9.82502ZM6.49923 9.95693C6.49923 8.73778 7.23833 7.74832 8.149 7.74832C9.05968 7.74832 9.79877 8.73778 9.79877 9.95693C9.79877 11.1761 9.05968 12.1655 8.149 12.1655C7.23833 12.1655 6.49923 11.1761 6.49923 9.95693ZM16.3957 17.5828C15.2947 17.5795 7.59908 17.5828 7.59908 17.5828V15.3742C7.59908 15.3742 15.2991 15.372 16.4001 15.3742L16.3957 17.5828ZM15.8479 12.1655C14.9373 12.1655 14.1982 11.1761 14.1982 9.95693C14.1982 8.73778 14.9373 7.74832 15.8479 7.74832C16.7586 7.74832 17.4977 8.73778 17.4977 9.95693C17.4977 11.1761 16.7586 12.1655 15.8479 12.1655Z" fill="#828991" />
    </svg>
  </div>;