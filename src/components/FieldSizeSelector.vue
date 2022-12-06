<template>
  <div>
    <select
      ref="select"
      name="fieldSize"
      id="fieldSize"
      :class="$style.fieldSizeSelect"
      :value="modelValue"
      @change="emits('update:modelValue', Number(select!.value))"
    >
      <option
        v-for="option in sizeOptions"
        :key="option"
        :value="option"
      >
        {{ `${option}x${option}`}}
      </option>
    </select>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';

  const select = ref<HTMLInputElement | null>(null);

  const emits = defineEmits<{
    (event: 'update:modelValue', value: number): void
  }>();

  defineProps<{
    modelValue: number;
    sizeOptions: number[];
  }>()
</script>

<style lang="scss" module>  
  .fieldSizeSelect {
    height: 32px;
    cursor: pointer;
  }
</style>