<script setup lang="ts">
defineProps<{
  count: number;
}>();
</script>

<template>
  <div class="flex items-center gap-1 text-red-400 font-semibold">
    <Icon name="ph:user" size="20" />
    <span>{{ count }}</span>
  </div>
</template>
