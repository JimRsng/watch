<script setup lang="ts">
defineProps<{
  src: string;
}>();
</script>

<template>
  <iframe
    allow="autoplay"
    class="w-full h-full"
    :src="src"
    frameborder="0"
    sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-forms allow-popups"
    :spellcheck="false"
  />
</template>
