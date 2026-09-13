export function applyUSRegionTimezone(locale: string, region?: string | null): string {
  if (locale !== "en-US") return locale;
  if (!region) return locale;

  const regionMap: Record<string, string> = {
    "us-west": "en-US-Pacific",
    "us-south": "en-US-Central",
    "us-central": "en-US-Central",
    "us-east": "en-US-Eastern"
  };

  return regionMap[region] ?? locale;
}
