export function applyUSRegionTimezone(locale: string, region?: string | null): string {
  // Only adjust US locale
  if (locale !== "en-US") return locale;

  // Region may not exist in Discord.js v14
  if (!region) return locale;

  const regionMap: Record<string, string> = {
    "us-west": "en-US-Pacific",
    "us-south": "en-US-Central",
    "us-central": "en-US-Central",
    "us-east": "en-US-Eastern"
  };

  return regionMap[region] ?? locale;
}
