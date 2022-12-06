<template>
  <div :class="[$style.square, $style[`${squareClass}`], {obstacle: isObstacle}]">
    {{ squareValue }}
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  value: null | [number, number];
}>()

const squareValue = computed(() => {
  return props.value !== null ? (props.value[0] === -1 ? '' : props.value[0]) : '';
});

const squareClass = computed(() => {
  return `square-${squareValue.value}`;
});

const isObstacle = computed(() => {
  return props.value !== null ? props.value[0] === -1 : false;
});
</script>

<style lang="scss" module>
  @import "@/styles/mixins";

  .square {
    display: grid;
    position: relative;
    justify-content: center;
    align-content: center;
    overflow: hidden;

    width: 78px;
    height: 78px;
    border-radius: 4px;
    color: #EEF3F3;
    font-size: 36px;
    font-weight: 700;
    user-select: none;

    &:global(.obstacle) {
      background-color: var(--color-background);
      border-radius: 0;
    }

    @include mobile() {
      font-size: 20px;
      width: 48px;
      height: 48px;
    }
  }


  .square-2 {
    background-color: #04A99D;
  }

  .square-4 {
    background-color: #0173B4;
  }

  .square-8 {
    background-color: #24338E;
  }

  .square-16 {
    background-color: #B57EA8;
  }

  .square-32 {
    background-color: #8E2589;
  }

  .square-64 {
    background-color: #106b22;
  }

  .square-128 {
    background-color: #F2C94C;
  }

  .square-256 {
    background-color: #0011cf;
  }

  .square-512 {
    background-color: #646e2b;
  }

  .square-1024 {
    font-size: 24px;
    background-color: #53a395;
  }

  .square-2048 {
    font-size: 24px;
    background-color: #BB2649;
  }
</style>
