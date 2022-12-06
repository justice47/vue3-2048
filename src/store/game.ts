import { ref, computed, readonly, watch } from 'vue'
import { defineStore } from 'pinia'
import { useGame } from '@/composables/useGame'
import { usePeerConnection } from '@/composables/usePeerConnection'
import { createEventHook } from '@vueuse/core'
import type { Direction } from '@/composables/useGame'

export const useGameStore = defineStore('game', () => {
  const isMultiplayerGameOpen = ref(false)
  const isRemotePlayerConnected = ref(false)
  const isPlayerHost = ref(true)
  const gameSize = ref(6)
  const gameObstacles = ref(2)
  const localSession = useGame(gameSize.value, gameObstacles.value)
  const remoteSession = useGame(gameSize.value, gameObstacles.value)
  const seed = ref(Math.random())
  const onNewGameTrigger = createEventHook<void>()

  const {
    id,
    isOpen, 
    createPeer,
    destroyPeer,
    connect,
    disconnect,
    sendMessage,
    onConnected,
    onDisconnected,
    onMessage,
    onError
  } = usePeerConnection()

  watch(gameSize, () : void => {
    localSession.size.value = gameSize.value
    remoteSession.size.value = gameSize.value
  })

  watch(gameObstacles, () : void => {
    localSession.obstacles.value = gameObstacles.value
    remoteSession.obstacles.value = gameObstacles.value
  })

  const openMultiplayerGame = () => {
    createPeer()

    isMultiplayerGameOpen.value = true
  }

  const closeMultiplayerGame = () => {
    destroyPeer()
    isMultiplayerGameOpen.value = false
    const params = new URLSearchParams(window.location.search)
    params.delete('game')
    window.history.pushState({}, '', window.location.pathname)
    remoteSession.init(Math.random())
  }

  const joinMultiplayerGame = (id: string) => {
    openMultiplayerGame()
    connect(id)
  }

  const leaveMultiplayerGame = () => {
    disconnect()
    closeMultiplayerGame()
  }

  const startNewGame = () => {
    localSession.init(seed.value)
    remoteSession.init(seed.value)

    if (isRemotePlayerConnected.value)
      sendMessage('new-game', {
        seed: seed.value,
        size: localSession.size.value,
        obstacles: localSession.obstacles.value
      })
  }

  onConnected(() => {
    isRemotePlayerConnected.value = true

    if (isPlayerHost.value)
      startNewGame()
  })

  onDisconnected(() => {
    isRemotePlayerConnected.value = false
    leaveMultiplayerGame()
  })

  onError(() => {
    leaveMultiplayerGame()
  })

  localSession.onRestart(() => {
    leaveMultiplayerGame()
  })

  localSession.onMove((direction: Direction) => sendMessage('move', { direction }))

  onMessage('new-game', ({ seed, size, obstacles }: { seed: number; size: number; obstacles: number }) => {
    gameObstacles.value = obstacles
    gameSize.value = size
    remoteSession.init(seed, size, obstacles)
    localSession.init(seed, size, obstacles)

    onNewGameTrigger.trigger()
  })

  onMessage('move', ({ direction }: { direction: Direction }) => {
    remoteSession.step(direction)
  })

  const isLocalPlayerWinner = computed(() => localSession.isGameWon.value || remoteSession.isGameOver.value)
  const isLocalPlayerLost = computed(() => remoteSession.isGameWon.value || localSession.isGameOver.value)
  const isWaitingForOtherPlayer = computed(() => isPlayerHost.value && isMultiplayerGameOpen.value && !isRemotePlayerConnected.value)

  startNewGame()

  return {
    startNewGame,
    openMultiplayerGame,
    closeMultiplayerGame,
    joinMultiplayerGame,
    leaveMultiplayerGame,
    onNewGame: onNewGameTrigger.on,

    gameSize,
    gameObstacles,

    localSession,
    remoteSession,

    isLocalPlayerWinner,
    isLocalPlayerLost,
    isMultiplayerGameOpen: readonly(isMultiplayerGameOpen),
    isRemotePlayerConnected: readonly(isRemotePlayerConnected),
    isWaitingForOtherPlayer: readonly(isWaitingForOtherPlayer),
    isPlayerHost,
    id: readonly(id),

    isOpen,
    link: computed(() => `${window.location.origin}?game=${id.value}`)
  }
})
