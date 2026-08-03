<script setup lang="ts">
const model = defineModel<Platform>({ default: preference.platform.default });
const switchValue = computed(() => model.value === "twitch");

const toggleChat = () => {
  model.value = model.value === "twitch" ? "kick" : "twitch";
};

onMounted(async () => {
  const platform = await storage.local.get<Platform>(preference.platform.key) ?? model.value;
  model.value = platform;
});

watch(model, (newValue) => {
  storage.local.set(preference.platform.key, newValue);
});
</script>

<template>
  <div class="flex items-center justify-center gap-1">
    <Icon name="simple-icons:kick" :class="{ 'text-lime-400': !switchValue }" size="20" />
    <USwitch v-model="switchValue" :ui="{ base: 'data-[state=unchecked]:bg-lime-400' }" @click="toggleChat" />
    <Icon name="simple-icons:twitch" :class="{ 'text-purple-400': switchValue }" size="20" />
  </div>
</template>
