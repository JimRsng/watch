const domain = "watch.jimtracker.com";

export const SITE = {
  name: "watch | JimTracker",
  domain: domain,
  hlsURL: import.meta.dev ? "http://127.0.0.1:8080/live/jimrsng.m3u8" : "https://hls.jimtracker.com/live/jimrsng.m3u8",
  host: import.meta.dev ? "http://localhost:5173" : `https://${domain}`,
  parent: import.meta.dev ? "localhost" : domain,
  github: {
    author: "JimRsng",
    repo: "https://github.com/JimRsng/watch"
  },
  platforms: {
    twitch: {
      user: "jimrsng"
    },
    kick: {
      user: "jimrisingtv"
    }
  }
};
