import HlsJs from "hls.js";

export default defineNuxtPlugin(() => {
  return {
    provide: {
      hls: HlsJs
    }
  };
});
