export const useLiveData = async () => {
  return useFetch<LiveData>("/live", {
    baseURL: SITE.serverURL,
    deep: true,
    default: () => ({
      isLive: false,
      viewerCount: 0,
      sessionId: ""
    })
  });
};
