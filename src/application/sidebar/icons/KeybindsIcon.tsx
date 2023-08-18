import { IconWrapper } from '../../components/icons/IconWrapper';
import { IconProps, IconType } from '../../components/icons/type';

export const KeybindsIcon: IconType = (props: IconProps) =>
  <IconWrapper {...props}>
    <svg className='self-center' fill="none" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 19C3.45 19 2.979 18.804 2.587 18.412C2.195 18.02 1.99934 17.5493 2 17V7C2 6.45 2.196 5.979 2.588 5.587C2.98 5.195 3.45067 4.99934 4 5H20C20.55 5 21.021 5.196 21.413 5.588C21.805 5.98 22.0007 6.45067 22 7V17C22 17.55 21.804 18.021 21.412 18.413C21.02 18.805 20.5493 19.0007 20 19H4ZM8 16H16V14H8V16ZM5 13H7V11H5V13ZM8 13H10V11H8V13ZM11 13H13V11H11V13ZM14 13H16V11H14V13ZM17 13H19V11H17V13ZM5 10H7V8H5V10ZM8 10H10V8H8V10ZM11 10H13V8H11V10ZM14 10H16V8H14V10ZM17 10H19V8H17V10Z" fill="#828991" />
    </svg>
  </IconWrapper>;