import type { SVGProps } from 'react';

export function BowlIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 4a8 8 0 0 0 -8 8h16a8 8 0 0 0 -8 -8" />
    </svg>
  );
}
