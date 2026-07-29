import FlvJs from "flv.js";

export default defineNuxtPlugin(() => {
  return {
    provide: {
      flvjs: FlvJs
    }
  };
});
