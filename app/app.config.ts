export default defineAppConfig({
  ui: {
    splitter: {
      slots: {
        handle: "data-[orientation=horizontal]:w-[4px] data-[orientation=vertical]:h-[4px] bg-border transition-colors data-[state=hover]:bg-primary data-[state=drag]:bg-primary"
      }
    }
  }
});
