const domain = "watch.jimtracker.com";
const hlsDomain = "hls.jimtracker.com";
const devDomain = "localhost";

export const SITE = {
  name: "watch | JimTracker",
  domain: domain,
  hlsURL: import.meta.dev ? `http://${devDomain}:8080` : `https://${hlsDomain}`,
  wsURL: import.meta.dev ? `ws://${devDomain}:8080` : `wss://${hlsDomain}`,
  host: import.meta.dev ? `http://${devDomain}:5173` : `https://${domain}`,
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
