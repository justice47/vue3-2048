<template>
  <div :class="$style.buttons">
    <ObstacleButton
      v-for="obstaclesCount in props.obstacles"
      :key="obstaclesCount"
      :button-number="obstaclesCount"
      :pressed-button="props.modelValue"
      @click="handleClick(obstaclesCount)"
    >
      {{ obstaclesCount }}
    </ObstacleButton>
  </div>
</template>

<script setup lang="ts">
  import ObstacleButton from '@/components/ObstacleButton.vue'

  const props = defineProps<{
    obstacles: number[];
    modelValue: number;
  }>()

  const emits = defineEmits<{
    (event: 'update:modelValue', value: number): void
  }>();

  const handleClick = (obstacles: number) => {
    emits('update:modelValue', obstacles)
  };
</script>

<style lang="scss" module>
  .buttons {
    display: grid;
    grid-auto-flow: column;
    column-gap: 4px;
  }
</style>
