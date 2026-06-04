type IconProps = React.SVGProps<SVGSVGElement> & { size?: number };

function svg(d: React.ReactNode, p: IconProps) {
  const { size = 16, className, ...rest } = p;
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ?? "shrink-0"}
      {...rest}
    >
      {d}
    </svg>
  );
}

export const PlusIcon = (p: IconProps) => svg(<path d="M12 5v14M5 12h14" />, p);
export const MinusIcon = (p: IconProps) => svg(<path d="M5 12h14" />, p);
export const MenuIcon = (p: IconProps) => svg(<path d="M3 6h18M3 12h18M3 18h18" />, p);
export const TrashIcon = (p: IconProps) => svg(<><path d="M3 6h18" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /></>, p);
export const QrIcon = (p: IconProps) => svg(<><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><path d="M14 14h3v3M21 14v.01M14 21v-3M21 18v3h-3M17 21h.01" /></>, p);
export const ExternalIcon = (p: IconProps) => svg(<><path d="M15 3h6v6" /><path d="M10 14L21 3" /><path d="M21 14v7H3V3h7" /></>, p);
export const UploadIcon = (p: IconProps) => svg(<><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="M17 8l-5-5-5 5" /><path d="M12 3v12" /></>, p);
export const LogoutIcon = (p: IconProps) => svg(<><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5" /><path d="M21 12H9" /></>, p);
export const FoldersIcon = (p: IconProps) => svg(<><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></>, p);
export const LayersIcon = (p: IconProps) => svg(<><path d="M12 2 2 7l10 5 10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></>, p);
export const ListIcon = (p: IconProps) => svg(<><path d="M8 6h13" /><path d="M8 12h13" /><path d="M8 18h13" /><path d="M3 6h.01M3 12h.01M3 18h.01" /></>, p);
export const ImageIcon = (p: IconProps) => svg(<><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="2" /><path d="M21 15l-5-5L5 21" /></>, p);
export const SettingsIcon = (p: IconProps) => svg(<><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.9 2.9l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.9-2.9l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.9-2.9l.1.1a1.7 1.7 0 0 0 1.8.3h0a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.9 2.9l-.1.1a1.7 1.7 0 0 0-.3 1.8v0a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" /></>, p);
export const GripIcon = (p: IconProps) => svg(<><circle cx="9" cy="6" r="1" /><circle cx="9" cy="12" r="1" /><circle cx="9" cy="18" r="1" /><circle cx="15" cy="6" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="15" cy="18" r="1" /></>, p);
export const CopyIcon = (p: IconProps) => svg(<><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></>, p);
export const DuplicateIcon = (p: IconProps) => CopyIcon(p);
export const CheckIcon = (p: IconProps) => svg(<path d="M20 6 9 17l-5-5" />, p);
export const XIcon = (p: IconProps) => svg(<><path d="M18 6 6 18" /><path d="m6 6 12 12" /></>, p);
export const ChevronLeftIcon = (p: IconProps) => svg(<path d="m15 18-6-6 6-6" />, p);
export const ChevronRightIcon = (p: IconProps) => svg(<path d="m9 18 6-6-6-6" />, p);
export const DownloadIcon = (p: IconProps) => svg(<><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="M7 10l5 5 5-5" /><path d="M12 15V3" /></>, p);
