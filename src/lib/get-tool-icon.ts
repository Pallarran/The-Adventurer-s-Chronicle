export type ToolIconKey =
  | "dndbeyond"
  | "roll20"
  | "foundry"
  | "discord"
  | "google-docs"
  | "google-sheets"
  | "google-drive"
  | "notion"
  | "world-anvil"
  | "owlbear"
  | "obsidian"
  | "github"
  | "reddit"
  | "youtube"
  | "dropbox"
  | "homebrewery"
  | "kobold-plus"
  | "generic";

interface DomainMapping {
  domain: string;
  pathPrefix?: string;
  key: ToolIconKey;
}

const DOMAIN_MAP: DomainMapping[] = [
  // D&D / TTRPG specific
  { domain: "dndbeyond.com", key: "dndbeyond" },
  { domain: "roll20.net", key: "roll20" },
  { domain: "foundryvtt.com", key: "foundry" },
  { domain: "worldanvil.com", key: "world-anvil" },
  { domain: "owlbear.rodeo", key: "owlbear" },
  { domain: "owlbear.app", key: "owlbear" },
  { domain: "homebrewery.naturalcrit.com", key: "homebrewery" },
  { domain: "koboldplus.club", key: "kobold-plus" },
  { domain: "kobold.club", key: "kobold-plus" },

  // Google suite — more specific paths first
  { domain: "docs.google.com", pathPrefix: "/spreadsheets", key: "google-sheets" },
  { domain: "docs.google.com", pathPrefix: "/document", key: "google-docs" },
  { domain: "docs.google.com", key: "google-docs" },
  { domain: "sheets.google.com", key: "google-sheets" },
  { domain: "drive.google.com", key: "google-drive" },

  // General productivity / social
  { domain: "discord.com", key: "discord" },
  { domain: "discord.gg", key: "discord" },
  { domain: "notion.so", key: "notion" },
  { domain: "notion.site", key: "notion" },
  { domain: "obsidian.md", key: "obsidian" },
  { domain: "github.com", key: "github" },
  { domain: "reddit.com", key: "reddit" },
  { domain: "youtube.com", key: "youtube" },
  { domain: "youtu.be", key: "youtube" },
  { domain: "dropbox.com", key: "dropbox" },
];

export function getToolIconKey(url: string): ToolIconKey {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();
    const pathname = parsed.pathname.toLowerCase();

    for (const mapping of DOMAIN_MAP) {
      if (hostname.includes(mapping.domain)) {
        if (mapping.pathPrefix && !pathname.startsWith(mapping.pathPrefix)) {
          continue;
        }
        return mapping.key;
      }
    }
  } catch {
    // Invalid URL — fall through to generic
  }

  return "generic";
}
