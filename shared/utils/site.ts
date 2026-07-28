export const SITE = {
  name: "streaming | JimTracker",
  domain: "streaming.jimtracker.com",
  flvURL: import.meta.dev ? "http://127.0.0.1:8080/live/jimrsng.flv" : "https://flv.jimtracker.com/live/jimrsng.flv",
  host: import.meta.dev ? "http://localhost:5173" : "https://streaming.jimtracker.com",
  github: {
    author: "JimRsng",
    repo: "https://github.com/JimRsng/streaming"
  }
};
