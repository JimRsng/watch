import { withQuery } from "ufo";
import { createStorage } from "unstorage";
import localStorageDriver from "unstorage/drivers/localstorage";

export const embed = {
  twitch: {
    stream: withQuery("https://player.twitch.tv", {
      channel: SITE.platforms.twitch.user,
      parent: SITE.parent,
      muted: true,
      autoplay: true
    }),
    chat: withQuery(`https://www.twitch.tv/embed/${SITE.platforms.twitch.user}/chat`, {
      parent: SITE.parent,
      darkpopout: true
    })
  },
  kick: {
    stream: withQuery(`https://player.kick.cx/${SITE.platforms.kick.user}`, {
      reload: false,
      pip: false
    }),
    chat: `https://chat.kick.cx/embed/${SITE.platforms.kick.user}`
  }
};

export const preference: Preferences = {
  volume: { key: "volume-preference", default: 1 },
  platform: { key: "platform-preference", default: "twitch" }
};

export const storage = {
  local: createStorage({
    driver: import.meta.client ? localStorageDriver({}) : undefined
  })
};
