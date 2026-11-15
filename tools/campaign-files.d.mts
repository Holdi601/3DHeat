/** Types of `campaign-files.mjs`: a campaign round's recordings on this machine, for the local viewer server. */
export interface CampaignRoundFiles {
  campaign: string;
  winner: string | null;
  sessions: { n: number; start: string | null; name: string; bytes: number; id: number }[];
  missing: number;
}
export function campaignIndex(config: { rounds?: string; recordings?: string | string[] } | null | undefined): {
  round(name: string): CampaignRoundFiles | null;
  file(id: number): string | null;
};
