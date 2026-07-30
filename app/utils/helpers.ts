import { withQuery } from "ufo";

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
    stream: withQuery(`https://player.kick.com/${SITE.platforms.kick.user}`, {
      autoplay: true,
      muted: true
    }),
    chat: `https://chat.kick.cx/embed/${SITE.platforms.kick.user}`
  }
};
