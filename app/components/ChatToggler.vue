<script setup lang="ts">
const chatToggle = ref<"twitch" | "kick">("kick");

const emit = defineEmits<{
  (e: "update:chatToggle", value: "twitch" | "kick"): void;
}>();

const toggleChat = () => {
  chatToggle.value = chatToggle.value === "twitch" ? "kick" : "twitch";
  emit("update:chatToggle", chatToggle.value);
};
</script>

<template>
  <div class="flex items-center justify-center gap-1">
    <Icon name="simple-icons:kick" />
    <USwitch :ui="{ base: 'data-[state=unchecked]:bg-lime-400' }" @click="toggleChat" />
    <Icon name="simple-icons:twitch" />
  </div>
</template>
