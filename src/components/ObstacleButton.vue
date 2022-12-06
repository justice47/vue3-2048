<template>
  <button :class="[$style.button, { buttonPressed: isPressed }]">
    <slot />
  </button>
</template>

<script setup lang="ts">
  import { computed } from 'vue';

  const props = defineProps<{
    pressedButton: number;
    buttonNumber: number;
  }>()

  const isPressed = computed(() => {
    return props.pressedButton === props.buttonNumber;
  });
</script>

<style lang="scss" module>
  .button {
    width: 32px;
    height: 32px;
    border-radius: 2px;
    border: 0;
    cursor: pointer;
    background-color: #E6E6E6;

    &:global(.buttonPressed) {
      background-color: #A2A2A2;
    }

    &:global(.buttonPressed:hover) {
      background-color: #A2A2A2;
    }
  }

  .button:hover {
    background-color: #808080;
  }
</style>
