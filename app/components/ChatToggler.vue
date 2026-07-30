<script setup lang="ts">
const model = defineModel<"twitch" | "kick">({ default: "kick" });

const toggleChat = () => {
  model.value = model.value === "twitch" ? "kick" : "twitch";
};
</script>

<template>
  <div class="flex items-center justify-center gap-1">
    <Icon name="simple-icons:kick" />
    <USwitch :ui="{ base: 'data-[state=unchecked]:bg-lime-400' }" @click="toggleChat" />
    <Icon name="simple-icons:twitch" />
  </div>
</template>
