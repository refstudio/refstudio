export function AddIcon() {
  return (
    <div className="flex h-6 w-6 items-center justify-center">
      <svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
        <path d="M11 13H5V11H11V5H13V11H19V13H13V19H11V13Z" fill="currentcolor" />
      </svg>
    </div>
  );
}

export function SampleIcon() {
  return (
    <div className="flex h-6 w-6 items-center justify-center">
      <svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M7 2V4H8V18C8 19.0609 8.42143 20.0783 9.17157 20.8284C9.92172 21.5786 10.9391 22 12 22C13.0609 22 14.0783 21.5786 14.8284 20.8284C15.5786 20.0783 16 19.0609 16 18V4H17V2H7ZM11 16C10.4 16 10 15.6 10 15C10 14.4 10.4 14 11 14C11.6 14 12 14.4 12 15C12 15.6 11.6 16 11 16ZM13 12C12.4 12 12 11.6 12 11C12 10.4 12.4 10 13 10C13.6 10 14 10.4 14 11C14 11.6 13.6 12 13 12ZM14 7H10V4H14V7Z"
          fill="currentcolor"
        />
      </svg>
    </div>
  );
}

export const RefStudioEditorIcon = () => (
  <div className="flex h-6 w-6 items-center justify-center">
    <svg height="20" viewBox="0 0 20 20" width="20" xmlns="http://www.w3.org/2000/svg">
      <path
        clipRule="evenodd"
        d="M2 0C0.895431 0 0 0.895431 0 2V18C0 19.1046 0.895431 20 2 20H18C19.1046 20 20 19.1046 20 18V2C20 0.895431 19.1046 0 18 0H2ZM4.59073 6.89017H7.03845C7.51688 6.89017 7.93267 6.96136 8.2858 7.10375C8.63893 7.24615 8.9109 7.45689 9.1017 7.73597C9.29535 8.01506 9.39218 8.35965 9.39218 8.76974C9.39218 9.12572 9.33665 9.42331 9.22558 9.66253C9.11452 9.90175 8.95931 10.0997 8.75996 10.2563C8.62403 10.3627 8.47243 10.4561 8.30517 10.5366L9.6015 13.0458V13.1098H7.99532L6.89748 10.9142H6.09012V13.1098H4.59073V6.89017ZM6.09012 9.75651H7.03845C7.22925 9.75651 7.38731 9.72234 7.51261 9.65399C7.63791 9.58564 7.73189 9.48881 7.79455 9.36351C7.86005 9.23536 7.8928 9.083 7.8928 8.90643C7.8928 8.72702 7.86005 8.57324 7.79455 8.44508C7.72904 8.31693 7.63222 8.21868 7.50407 8.15033C7.37876 8.08198 7.22355 8.04781 7.03845 8.04781H6.09012V9.75651ZM13.8672 11.1961C13.8956 11.273 13.9099 11.3598 13.9099 11.4567C13.9099 11.5677 13.8828 11.6703 13.8287 11.7642C13.7746 11.8554 13.6892 11.9294 13.5724 11.9864C13.4557 12.0405 13.3019 12.0675 13.1111 12.0675C12.9345 12.0675 12.7779 12.0519 12.6412 12.0205C12.5045 11.9864 12.3891 11.9323 12.2952 11.8582C12.2012 11.7813 12.13 11.6802 12.0816 11.5549C12.0332 11.4296 12.009 11.2758 12.009 11.0936H10.5053C10.5053 11.4609 10.5793 11.7785 10.7274 12.0462C10.8784 12.311 11.0791 12.5289 11.3297 12.6997C11.5804 12.8678 11.8594 12.9931 12.167 13.0757C12.4774 13.1554 12.7921 13.1953 13.1111 13.1953C13.4585 13.1953 13.7732 13.1568 14.0551 13.0799C14.3371 13.003 14.5791 12.8906 14.7813 12.7425C14.9835 12.5915 15.1387 12.4078 15.2469 12.1914C15.3552 11.975 15.4093 11.7272 15.4093 11.4481C15.4093 11.1861 15.3623 10.9512 15.2683 10.7433C15.1772 10.5354 15.0419 10.3503 14.8625 10.188C14.6859 10.0228 14.4681 9.87612 14.2089 9.74797C13.9526 9.61697 13.6593 9.49878 13.3289 9.39341C13.1524 9.33646 12.9929 9.27808 12.8505 9.21827C12.7109 9.15847 12.5913 9.09581 12.4917 9.03031C12.3948 8.96481 12.3194 8.89504 12.2653 8.821C12.214 8.74411 12.1884 8.65867 12.1884 8.56469C12.1884 8.45078 12.2211 8.34683 12.2866 8.25285C12.3521 8.15603 12.4489 8.07914 12.5771 8.02218C12.7052 7.96522 12.8633 7.93675 13.0513 7.93675C13.2449 7.93675 13.4058 7.97092 13.534 8.03927C13.6621 8.10761 13.7575 8.20159 13.8202 8.3212C13.8857 8.44081 13.9184 8.57893 13.9184 8.73556H15.4093C15.4093 8.34256 15.3096 8.00224 15.1102 7.71461C14.9137 7.42413 14.6404 7.20058 14.2901 7.04395C13.9426 6.88447 13.5411 6.80473 13.0854 6.80473C12.7408 6.80473 12.4233 6.84602 12.1328 6.92861C11.8424 7.00835 11.5889 7.12511 11.3725 7.2789C11.1589 7.42983 10.9923 7.61352 10.8727 7.82995C10.7531 8.04354 10.6933 8.28418 10.6933 8.55188C10.6933 8.83097 10.7516 9.07588 10.8684 9.28662C10.9852 9.49451 11.1432 9.67677 11.3426 9.8334C11.5419 9.98718 11.7683 10.1225 12.0218 10.2392C12.2752 10.3531 12.5387 10.4557 12.812 10.5468C13.0456 10.6237 13.2335 10.6977 13.3759 10.7689C13.5212 10.8373 13.6322 10.9056 13.7091 10.974C13.786 11.0423 13.8387 11.1164 13.8672 11.1961Z"
        fill="currentcolor"
        fillRule="evenodd"
      />
    </svg>
  </div>
);

export const PdfEditorIcon = () => (
  <div className="flex h-6 w-6 items-center justify-center">
    <svg height="20" viewBox="0 0 20 20" width="20" xmlns="http://www.w3.org/2000/svg">
      <path
        clipRule="evenodd"
        d="M0 2C0 0.895431 0.895431 0 2 0H18C19.1046 0 20 0.895431 20 2V18C20 19.1046 19.1046 20 18 20H2C0.895431 20 0 19.1046 0 18V2ZM15 8.5H16.5V7H13.5V13H15V11H16.5V9.5H15V8.5ZM12.5 11.5C12.5 12.3 11.8 13 11 13H8.5V7H11C11.8 7 12.5 7.7 12.5 8.5V11.5ZM11 8.5H10V11.5H11V8.5ZM6 11C6.8 11 7.5 10.3 7.5 9.5V8.5C7.5 7.7 6.8 7 6 7H3.5V13H5V11H6ZM5 8.5H6V9.5H5V8.5Z"
        fill="currentcolor"
        fillRule="evenodd"
      />
    </svg>
  </div>
);

export const EmptyStateIcon = () => (
  <div className="flex h-12 w-12 items-center justify-center">
    <svg height="48" viewBox="0 0 49 48" width="49" xmlns="http://www.w3.org/2000/svg">
      <g clipPath="url(#clip0_1250_4005)">
        <path d="M32.9999 30H36.9999V48H32.9999V30Z" fill="currentcolor" />
        <path d="M25.9999 41V37H43.9999V41H25.9999Z" fill="currentcolor" />
        <path d="M3.99991 3V45L21.5 45V41H8.00001V7H29V27L32.9999 27V13V12V7.5V3H3.99991Z" fill="currentcolor" />
        <path d="M48.4999 16L32.9999 7.5V12L43.4999 17.5L37.9999 27L40.9999 29L48.4999 16Z" fill="currentcolor" />
        <path d="M11.9999 10.5H24.9999V14.5H11.9999V10.5Z" fill="currentcolor" />
        <path d="M11.9999 18H20.4999V22H11.9999V18Z" fill="currentcolor" />
      </g>
      <defs>
        <clipPath id="clip0_1250_4005">
          <rect fill="white" height="48" transform="translate(0.5)" width="48" />
        </clipPath>
      </defs>
    </svg>
  </div>
);
