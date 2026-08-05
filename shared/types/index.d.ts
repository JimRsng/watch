declare global {
  type Platform = "twitch" | "kick";

  type StorageKeyDefault<T = unknown> = { key: string, default: T };

  interface StorageKeyValues {
    volume: StorageKeyDefault<number>;
    platform: StorageKeyDefault<Platform>;
    uuid: StorageKeyDefault<string>;
  }
}

export {};
