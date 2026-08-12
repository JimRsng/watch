const domain = "watch.jimtracker.com";
const serverDomain = "hls.jimtracker.com";
const devDomain = "localhost";

export const SITE = {
  name: "watch | JimTracker",
  domain: domain,
  serverURL: import.meta.dev ? `http://${devDomain}:8080` : `https://${serverDomain}`,
  muxURL: "https://stream.mux.com/VCZxdkiL2h44SCINGaR83pC1iMfg7ntrBL800h4YZ1AE.m3u8",
  wsURL: import.meta.dev ? `ws://${devDomain}:8080` : `wss://${serverDomain}`,
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
