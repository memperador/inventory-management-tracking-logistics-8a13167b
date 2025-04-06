
import { LucideProps } from 'lucide-react';

export const EquipmentIcon = (props: LucideProps) => (
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
    <path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
    <path d="m14.5 9-.5-5H5l-.5 5" />
    <path d="m10 3 2-2 2 2" />
    <path d="M7 9h10" />
    <path d="M8 21h8" />
    <path d="M18 9v12" />
    <path d="M6 9v12" />
  </svg>
);

export const ProjectIcon = (props: LucideProps) => (
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
    <rect width="18" height="18" x="3" y="3" rx="2" />
    <path d="M7 7h10" />
    <path d="M7 12h10" />
    <path d="M7 17h10" />
  </svg>
);

export { Building as BuildingIcon, User as UserIcon } from 'lucide-react';
