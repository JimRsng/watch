export const createWebsocket = async ({
  ws,
  liveData,
  uuid
}: {
  ws: Ref<WebSocket | null>;
  liveData: Ref<{ viewerCount: number, isLive: boolean, sessionId?: string }>;
  uuid: Ref<string | null>;
}) => {
  try {
    ws.value = new WebSocket(SITE.wsURL);
    await new Promise<void>((resolve, reject) => {
      ws.value?.addEventListener("open", () => {
        console.info("[jimtracker] Connected to WebSocket server.");
        resolve();
      });
      ws.value?.addEventListener("error", reject);
      ws.value?.addEventListener("close", reject);
    });
    ws.value.addEventListener("message", (message) => {
      const { type, viewerCount, isLive } = JSON.parse(message.data?.toString() || "{}") as { type: "liveInfo", viewerCount: number, isLive: boolean };
      if (type === "liveInfo") {
        liveData.value.viewerCount = viewerCount;
        liveData.value.isLive = isLive;
        ws.value?.send(JSON.stringify({ type: "heartbeat", uuid: uuid.value }));
      }
    });
    ws.value.addEventListener("error", (error) => {
      console.info("[jimtracker] WebSocket error:", error);
      liveData.value.isLive = false;
      ws.value?.close();
    });
    ws.value.addEventListener("close", () => {
      console.info("[jimtracker] Disconnected from WebSocket server.");
      liveData.value.isLive = false;
      ws.value = null;
    });
  }
  catch (error) {
    console.info("[jimtracker] Failed to connect to WebSocket server:", error);
    liveData.value.isLive = false;
    ws.value = null;
  }
};
