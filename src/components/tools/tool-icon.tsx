import { Link2 } from "lucide-react";
import { getToolIconKey, type ToolIconKey } from "@/lib/get-tool-icon";
import {
  DndBeyondIcon,
  Roll20Icon,
  FoundryVttIcon,
  DiscordIcon,
  GoogleDocsIcon,
  GoogleSheetsIcon,
  GoogleDriveIcon,
  NotionIcon,
  WorldAnvilIcon,
  OwlbearRodeoIcon,
  ObsidianIcon,
  GitHubIcon,
  RedditIcon,
  YouTubeIcon,
  DropboxIcon,
  HomebreweryIcon,
  KoboldPlusIcon,
} from "@/components/icons/tool-icons";
import type { ComponentType, SVGProps } from "react";

const ICON_COMPONENTS: Record<
  ToolIconKey,
  ComponentType<SVGProps<SVGSVGElement>>
> = {
  dndbeyond: DndBeyondIcon,
  roll20: Roll20Icon,
  foundry: FoundryVttIcon,
  discord: DiscordIcon,
  "google-docs": GoogleDocsIcon,
  "google-sheets": GoogleSheetsIcon,
  "google-drive": GoogleDriveIcon,
  notion: NotionIcon,
  "world-anvil": WorldAnvilIcon,
  owlbear: OwlbearRodeoIcon,
  obsidian: ObsidianIcon,
  github: GitHubIcon,
  reddit: RedditIcon,
  youtube: YouTubeIcon,
  dropbox: DropboxIcon,
  homebrewery: HomebreweryIcon,
  "kobold-plus": KoboldPlusIcon,
  generic: Link2,
};

// Official brand colors from Simple Icons
// Omitting very dark brands (GitHub #181717, Notion #000000) — they inherit the parent color
const BRAND_COLORS: Partial<Record<ToolIconKey, string>> = {
  dndbeyond: "#ED1C24",
  roll20: "#E10085",
  foundry: "#FE6A1F",
  discord: "#5865F2",
  "google-docs": "#4285F4",
  "google-sheets": "#34A853",
  "google-drive": "#4285F4",
  reddit: "#FF4500",
  youtube: "#FF0000",
  dropbox: "#0061FF",
  obsidian: "#7C3AED",
};

interface ToolIconComponentProps {
  url: string;
  className?: string;
}

export function ToolIcon({ url, className }: ToolIconComponentProps) {
  const key = getToolIconKey(url);
  const IconComponent = ICON_COMPONENTS[key];
  const brandColor = BRAND_COLORS[key];

  return (
    <IconComponent
      className={className}
      style={brandColor ? { color: brandColor } : undefined}
    />
  );
}
