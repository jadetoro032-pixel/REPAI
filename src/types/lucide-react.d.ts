declare module "lucide-react" {
  import type { ComponentType, SVGProps } from "react";

  export type LucideIcon = ComponentType<SVGProps<SVGSVGElement> & { size?: number | string }>;

  export const Activity: LucideIcon;
  export const BadgeCheck: LucideIcon;
  export const BarChart3: LucideIcon;
  export const Bot: LucideIcon;
  export const Brain: LucideIcon;
  export const CalendarClock: LucideIcon;
  export const CheckCircle2: LucideIcon;
  export const Database: LucideIcon;
  export const FileSearch: LucideIcon;
  export const FolderUp: LucideIcon;
  export const Mic: LucideIcon;
  export const MicOff: LucideIcon;
  export const Network: LucideIcon;
  export const PhoneCall: LucideIcon;
  export const Send: LucideIcon;
  export const ShieldCheck: LucideIcon;
  export const Sparkles: LucideIcon;
  export const Users: LucideIcon;
}
