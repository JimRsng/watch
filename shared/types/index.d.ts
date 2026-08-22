declare global {
  type Platform = "twitch" | "kick";

  type StorageKeyDefault<T = unknown> = { key: string, default: T };

  interface StorageKeyValues {
    volume: StorageKeyDefault<number>;
    platform: StorageKeyDefault<Platform>;
    uuid: StorageKeyDefault<string>;
  }

  interface LiveData {
    isLive: boolean;
    viewerCount: number;
    sessionId: string;
  }

  interface LiveDataMessage extends LiveData {
    type: "liveInfo";
  }
}

export {};
