declare global {
  type Platform = "twitch" | "kick";

  interface Preferences {
    volume: { key: string, default: number };
    platform: { key: string, default: Platform };
  }
}

export {};
