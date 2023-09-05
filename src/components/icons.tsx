export const CircleIcon = () => (
  <div className="flex h-6 w-6 items-center justify-center">
    <div className="h-2 w-2 shrink-0 rounded-2xl bg-current" />
  </div>
);

export const SearchIcon = () => (
  <div className="flex h-6 w-6 items-center justify-center">
    <svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M19.6 21L13.3 14.7C12.8 15.1 12.225 15.4167 11.575 15.65C10.925 15.8833 10.2333 16 9.5 16C7.68333 16 6.146 15.3707 4.888 14.112C3.63 12.8533 3.00067 11.316 3 9.5C3 7.68333 3.62933 6.146 4.888 4.888C6.14667 3.63 7.684 3.00067 9.5 3C11.3167 3 12.854 3.62933 14.112 4.888C15.37 6.14667 15.9993 7.684 16 9.5C16 10.2333 15.8833 10.925 15.65 11.575C15.4167 12.225 15.1 12.8 14.7 13.3L21 19.6L19.6 21ZM9.5 14C10.75 14 11.8127 13.5623 12.688 12.687C13.5633 11.8117 14.0007 10.7493 14 9.5C14 8.25 13.5623 7.18733 12.687 6.312C11.8117 5.43667 10.7493 4.99933 9.5 5C8.25 5 7.18733 5.43767 6.312 6.313C5.43667 7.18833 4.99933 8.25067 5 9.5C5 10.75 5.43767 11.8127 6.313 12.688C7.18833 13.5633 8.25067 14.0007 9.5 14Z"
        fill="currentcolor"
      />
    </svg>
  </div>
);

export const CloseIcon = () => (
  <div className="flex h-6 w-6 shrink-0 items-center justify-center">
    <svg height="12" viewBox="0 0 12 12" width="12" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M6.00012 7.41433L1.75748 11.657L0.343262 10.2428L4.5859 6.00012L0.343262 1.75748L1.75748 0.343262L6.00012 4.5859L10.2428 0.343262L11.657 1.75748L7.41433 6.00012L11.657 10.2428L10.2428 11.657L6.00012 7.41433Z"
        fill="currentcolor"
      />
    </svg>
  </div>
);

export const OpenIcon = () => (
  <div className="flex h-6 w-6 shrink-0 items-center justify-center">
    <svg height="12" viewBox="0 0 16 12" width="16" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M1.6 12C1.16 12 0.783201 11.853 0.469601 11.559C0.156001 11.265 -0.000531975 10.912 1.35823e-06 10.5V1.5C1.35823e-06 1.0875 0.156801 0.734251 0.470401 0.440251C0.784001 0.146251 1.16053 -0.000498727 1.6 1.27334e-06H6.4L8 1.5H14.4C14.84 1.5 15.2168 1.647 15.5304 1.941C15.844 2.235 16.0005 2.588 16 3V10.5C16 10.9125 15.8432 11.2657 15.5296 11.5597C15.216 11.8537 14.8395 12.0005 14.4 12H1.6Z"
        fill="currentcolor"
      />
    </svg>
  </div>
);

export function ChevronDownIcon() {
  return (
    <div className="flex h-6 w-6 items-center justify-center">
      <svg height="8" viewBox="0 0 12 8" width="12" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M1.41 0.290039L6 4.88004L10.59 0.290039L12 1.71004L6 7.71004L0 1.71004L1.41 0.290039Z"
          fill="currentcolor"
        />
      </svg>
    </div>
  );
}

export function ChevronUpIcon() {
  return (
    <div className="flex h-6 w-6 items-center justify-center">
      <svg height="8" viewBox="0 0 12 8" width="12" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M10.59 7.71008L6 3.12008L1.41 7.71008L-1.2414e-07 6.29008L6 0.290083L12 6.29008L10.59 7.71008Z"
          fill="currentcolor"
        />
      </svg>
    </div>
  );
}
