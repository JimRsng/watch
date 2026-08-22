export const useLiveData = async () => {
  return useFetch<LiveData>("/live", {
    baseURL: SITE.serverURL,
    deep: true,
    server: false,
    default: () => ({
      isLive: false,
      viewerCount: 0,
      sessionId: ""
    })
  });
};
