<script setup lang="ts">
const model = defineModel<Platform>({ default: "kick" });
const switchValue = computed(() => model.value === "twitch");

const toggleChat = () => {
  model.value = model.value === "twitch" ? "kick" : "twitch";
};

const key = "platform-preference";

onMounted(() => {
  const preference = localStorage.getItem(key) as Platform | null;
  if (!preference) localStorage.setItem(key, model.value);
  else model.value = preference;
});

watch(model, (newValue) => {
  localStorage.setItem(key, newValue);
});
</script>

<template>
  <div class="flex items-center justify-center gap-1">
    <Icon name="simple-icons:kick" />
    <USwitch v-model="switchValue" :ui="{ base: 'data-[state=unchecked]:bg-lime-400' }" @click="toggleChat" />
    <Icon name="simple-icons:twitch" />
  </div>
</template>
