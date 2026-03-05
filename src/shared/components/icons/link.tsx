import { cn } from "@/shared/lib/utils";

interface LinkIconProps {
  className?: string;
}

export function LinkIcon({ className }: LinkIconProps) {
  return (
    <svg
      className={cn("size-4", className)}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <title>External link</title>
      <g clipPath="url(#external-clip)">
        <path
          d="M20 25.9999C20.8589 27.1482 21.9547 28.0983 23.2131 28.7858C24.4715 29.4733 25.863 29.8822 27.2933 29.9846C28.7236 30.087 30.1592 29.8807 31.5027 29.3795C32.8462 28.8783 34.0662 28.0941 35.08 27.0799L41.08 21.0799C42.9016 19.1939 43.9095 16.6679 43.8867 14.0459C43.864 11.424 42.8123 8.91583 40.9582 7.06175C39.1041 5.20766 36.596 4.15597 33.974 4.13319C31.352 4.11041 28.826 5.11835 26.94 6.93993L23.5 10.3599"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M28.0001 22C27.1412 20.8517 26.0454 19.9016 24.787 19.2141C23.5286 18.5266 22.1371 18.1177 20.7068 18.0153C19.2765 17.9129 17.8409 18.1192 16.4974 18.6204C15.1539 19.1216 13.9339 19.9058 12.9201 20.92L6.92009 26.92C5.09851 28.806 4.09057 31.332 4.11335 33.954C4.13614 36.5759 5.18783 39.0841 7.04191 40.9381C8.89599 42.7922 11.4041 43.8439 14.0261 43.8667C16.648 43.8895 19.1741 42.8815 21.0601 41.06L24.4801 37.64"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="external-clip">
          <rect width="48" height="48" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}
