<template>
  <div
    ref="field"
    :class="[$style.field, {shaded: !isLocal}]"
  >
    <div :class="$style.emptyCells">
      <div
        v-for="cell, index in boardItemsFlat"
        :key="index"
        :class="$style.emptyCell"
      />
    </div>

    <div  
      v-auto-animate="{ duration: 100 }"
      :class="$style.tiles"
    >
      <FieldSquare
        v-for="square, squareIndex in boardItemsFlat"
        :key="square ? square[1] : `square-${squareIndex}`"
        :value="square"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref, watch } from 'vue';
  import { SwipeDirection } from '@vueuse/core'
  import { useSwipe } from '@vueuse/core'
  import { useGameStore } from '@/store/game';
  import FieldSquare from './FieldSquare.vue';

  const props = withDefaults(defineProps<{
    size: number;
    obstacles: number;
    isLocal?: boolean;
  }>(), {
    isLocal: true
  })

  const field = ref<HTMLElement>()

  const { localSession, remoteSession } = useGameStore()
  const boardItemsFlat = computed(() => game.value.boardItemsFlat)
  const gridTemplateColumns = computed(() => `repeat(${game.value.board[0].length}, 1fr)`)
  const gridTemplateRows = computed(() => `repeat(${game.value.board.length}, 1fr)`)

  const { direction } = useSwipe(field, {
    threshold: 10,
  })

  const game = computed(() => {
    return props.isLocal ? localSession : remoteSession
  })

  watch(direction, () => {
    if (props.isLocal) {
      if (direction.value === SwipeDirection.UP)
        game.value.step('UP');

      if (direction.value === SwipeDirection.DOWN)
        game.value.step('DOWN');

      if (direction.value === SwipeDirection.LEFT)
        game.value.step('LEFT');

      if (direction.value === SwipeDirection.RIGHT)
        game.value.step('RIGHT');
    }
  })

  const onKeyPress = (event: KeyboardEvent) : void => {
    if (props.isLocal) {
      if (event.key === 'ArrowLeft') {
        game.value.step('LEFT');
      } else if (event.key === 'ArrowRight') {
        game.value.step('RIGHT');
      } else if (event.key === 'ArrowUp') {
        game.value.step('UP');
      } else if (event.key === 'ArrowDown') {
        game.value.step('DOWN');
      }
    }
  };

  onMounted(() => {
    addEventListener('keydown', onKeyPress)
  });
</script>

<style lang="scss" module>
  @import "@/styles/mixins";

  .field {
    position: relative;

    &:global(.shaded:before) {
      content: "";
      width: 100%;
      height: 100%;
      background-color: black;
      opacity: 0.5;
      position: absolute;
      z-index: 1;
    }
  }

  .emptyCells {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    display: grid;
    grid-template-columns: v-bind(gridTemplateColumns);
    grid-template-rows: v-bind(gridTemplateRows);
    grid-gap: 8px;
  }

  .emptyCell {
    display: flex;
    background-color: #88B6A2;
    border-radius: 4px;
    width: 78px;
    height: 100%;

    @include mobile() {
      width: 48px;
    }
  }

  .tiles {
    position: relative;

    display: grid;
    grid-template-columns: v-bind(gridTemplateColumns);
    grid-template-rows: v-bind(gridTemplateRows);
    grid-gap: 8px;
  }
</style>