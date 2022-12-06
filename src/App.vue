<template>
  <div :class="$style.game">
    <div :class="$style.settings">
      <div :class="$style.obstaclesOptions">
        <span>
          Set obstacles:
        </span>

        <ButtonsGroup
          v-model="obstacles"
          :obstacles="obstaclesOptions"
        />
      </div>

      <div :class="$style.gridOptions">
        <span>
          Set field size:
        </span>

        <FieldSizeSelector
          v-model="size"
          :sizeOptions="sizeOptions"
        />
      </div>
    </div>

    <div :class="$style.gameWrapper">
      <StandardButton
        v-if="showRestartButton"
        @click="updateGameOptions"
      >
        Restart game
      </StandardButton>

      <GameField
        :size="Number(game.gameSize)" 
        :obstacles="Number(game.gameObstacles)"
      />
    </div>

    <StandardButton
      v-if="!game.isMultiplayerGameOpen"
      :class="$style.gameModeSwitcher"
      @click="startMultiplayer"
    >
      Multiplayer
    </StandardButton>

    <StandardButton
      v-else
      :class="$style.gameModeSwitcher"
      @click="closeMultiplayer"
    >
      Local game
    </StandardButton>

    <div
      v-if="game.isMultiplayerGameOpen"
      :class="$style.remoteGame"
    >
      <div
        v-if="game.isWaitingForOtherPlayer"
        :class="$style.shareLink"
      >
        <span>Give this link to your friend:</span>

        <span
          @click="copy(game.link)"
          :class="$style.copyLink"
        >
          <template v-if="game.id !== undefined">
            {{ game.link }}
          </template>
        </span>

        <span v-if="copied">
          Copied!
        </span>
      </div>

      <GameField
        v-else
        :is-local="false"
        :size="Number(game.gameSize)" 
        :obstacles="Number(game.gameObstacles)"
      />
    </div>

    <vue-final-modal
      v-model="game.isLocalPlayerLost"
      classes="modal"
      content-class="modalContent"
      @closed="game.startNewGame"
    >
      <span :class="$style.modalTitle">Game over 😿</span>

      <button
        :class="$style.dialogButton"
        @click="game.startNewGame"
      >
        Restart
      </button>
    </vue-final-modal>

    <vue-final-modal
      v-model="game.isLocalPlayerWinner"
      classes="modal"
      content-class="modalContent"
      @closed="game.startNewGame"
    >
      <span :class="$style.modalTitle">You won! 😼</span>

      <button
        :class="$style.dialogButton"
        @click="game.startNewGame"
      >
        Restart
      </button>
    </vue-final-modal>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { useClipboard } from '@vueuse/core'
  import { useGameStore } from './store/game'
  import GameField from './components/GameField.vue'
  import ButtonsGroup from './components/ButtonsGroup.vue'
  import StandardButton from './components/StandardButton.vue';
  import FieldSizeSelector from './components/FieldSizeSelector.vue'

  const { copy, copied } = useClipboard()

  const params = new URLSearchParams(window.location.search)
  const gameId = params.get('game')

  const obstaclesOptions = [...Array(5).keys()]
  const sizeOptions = Array.from({length: 10 - 4 + 1}, (_, i) => i + 4)
  const obstacles = ref(2)
  const size = ref(6)

  const game = useGameStore()

  if (gameId) {
    game.isPlayerHost = false
    game.joinMultiplayerGame(gameId)
  }

  const showRestartButton = computed(() => {
    return size.value !== game.gameSize || obstacles.value !== game.gameObstacles
  })

  game.onNewGame(() => {
    size.value = game.gameSize
    obstacles.value = game.gameObstacles
  })

  const updateGameOptions = () => {
    game.gameSize = size.value
    game.gameObstacles = obstacles.value
    game.localSession.handleGameRestart()
    game.remoteSession.handleGameRestart()
  }

  const startMultiplayer = () => {
    game.openMultiplayerGame()
  }

  const closeMultiplayer = () => {
    game.closeMultiplayerGame()
  }
</script>

<style lang="scss" module>
  @import "@/styles/mixins";

  .game {
    display: grid;
    grid-template-rows: auto 1fr auto;
    grid-auto-flow: column;
    row-gap: 16px;

    align-items: start;
    column-gap: 16px;

    @include mobile() {
      grid-template-rows: auto;
      grid-auto-flow: row;
    }
  }

  .settings {
    width: 100%;
    display: grid;
    grid-auto-flow: column;
    justify-content: space-between;
    column-gap: 8px;
  }

  .obstaclesOptions {
    display: grid;
    row-gap: 2px;
  }

  .gridOptions {
    display: grid;
    justify-items: end;
    row-gap: 2px;
  }

  .restartGameButton {
    cursor: pointer;
  }

  .gameWrapper {
    display: grid;
    row-gap: 16px;
  }

  .gameModeSwitcher {
    justify-self: right;
  }

  .remoteGame {
    align-self: center;
    grid-row-start: 2;
    display: grid;

    @include mobile() {
      grid-row-start: initial;
    }
  }

  .shareLink {
    grid-row-start: 2;
    align-self: center;
    display: grid;
    row-gap: 8px;
  }

  .copyLink {
    cursor: pointer;
  }

  .dialogButton {
    cursor: pointer;
  }
</style>

<style scoped>
  :deep .modal {
    display: grid;
    justify-content: center;
    align-items: center;
  }

  :deep .modalContent {
    display: grid;
    padding: 16px;
    row-gap: 8px;
    border: 1px solid #e2e8f0;
    border-radius: 0.25rem;
    background: #181818;
  }

  .modalTitle {
    font-size: 1.5rem;
    font-weight: 700;
  }
</style>
