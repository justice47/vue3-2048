import { createRandom, deepClone, isArrayEqual, rotateMatrix } from '@/utils'
import { ref, computed } from 'vue'
import { useGameStore } from '@/store/game'
import { createEventHook } from '@vueuse/core'
import pinia from '@/store'

let id = 0
const createId = () => id += 1

export type FieldTile = [number, number] | null
export type Field = FieldTile[][]
export type Direction = 'UP' | 'LEFT' | 'DOWN' | 'RIGHT'

const directionToRotation = (direction: Direction) => {
  switch (direction) {
    case 'UP':
      return 0
    case 'LEFT':
      return 1
    case 'DOWN':
      return 2
    case 'RIGHT':
      return 3
  }
}

export function useGame(
  startSize: number,
  startObstacles: number
) {
  const gameStore = useGameStore(pinia)
  const onMoveHook = createEventHook<Direction>()
  const onRestartHook = createEventHook<void>()
  const seed = ref(Math.random())
  let rand = createRandom(seed.value)
  const winningScore = 2048
  const score = ref(0)
  const hasWon = ref(false)
  const isGameOver = ref(false)
  const size = ref(startSize)
  const columns = ref(startSize)
  const obstacles = ref(startObstacles)
  const defaultBoard = computed(() => Array.from({ length: size.value }).map(() => Array.from({ length: size.value }).map(() => null)))
  const board = ref<Field>(deepClone(defaultBoard.value))
  const boardItemsFlat = computed(() => board.value.flat())

  const largestTile = computed(() => Math.max(...board.value.map(x => x.map(y => y ? y[0] : 0)).flat()))
  const isGameWon = computed(() => largestTile.value >= winningScore)

  const handleGameRestart = () => {
    obstacles.value = gameStore.gameObstacles
    size.value = gameStore.gameSize

    id = 0
    board.value = deepClone(defaultBoard.value)
    score.value = 0
    board.value = setRandomTile(board.value)
    board.value = setRandomTile(board.value)
    setObstacles(gameStore.gameObstacles)
    isGameOver.value = false
    onRestartHook.trigger()
  }

  const handleGameOver = () => {
    handleGameRestart()
  }

  const checkIsGameOver = (board: Field) => {
    for (let i = 0; i < board.length; i++) {
      for (let x = 0; x < board[i].length; x++) {
        if (board[i][x] === null)
          return false
      }
    }

    for (let i = 0; i < board.length; i++) {
      for (let x = 0; x < board[i].length; x++) {
        if (i + 1 < board.length) {
          const current = board[i][x]
          const next = board[i + 1][x]

          if (current![0] !== -1 && current![0] === next![0])
            return false
        }

        if (x + 1 < board[i].length) {
          const current = board[i][x]
          const next = board[i][x + 1]

          if (current![0] !== -1 && current![0] === next![0])
            return false
        }
      }
    }

    return true
  }

  const setObstacles = (obstaclesNumber: number) => {
    for (let i = 0; i < obstaclesNumber; i++) {
      const row = rand(0, size.value - 1)
      const column = rand(0, size.value - 1)

      // Make sure that the obstacles is not placed diagonally
      if (board.value[row][column] === null) {
        if (row > 0 && column > 0) {
          if (board.value[row-1][column-1] !== null) {
            i--
            continue
          }
        }

        if (row > 0 && column < size.value - 1) {
          if (board.value[row-1][column+1] !== null) {
            i--
            continue
          }
        }

        if (row < size.value - 1 && column > 0) {
          if (board.value[row+1][column-1] !== null) {
            i--
            continue
          }
        }

        if (row < size.value - 1 && column < size.value - 1) {
          if (board.value[row+1][column+1] !== null) {
            i--
            continue
          }
        } 

        board.value[row][column] = [-1, createId()]
      } else {
        i--
      }
    }
  }

  const setRandomTile = (board: Field) => {
    const row = rand(0, size.value - 1)
    const column = rand(0, size.value - 1)

    if (board[row][column] !== null)
      setRandomTile(board)
    else
      board[row][column] = [2, createId()]

    if (checkIsGameOver(board)) {
      isGameOver.value = true
      return board
    }

    return board
  }

  const step = (direction: Direction) => {
    const [startRow, endRow, rowStep] = [0, size.value, 1]
    const [startColumn, endColumn, columnStep] = [0, size.value, 1]

    const rotations = directionToRotation(direction)
    let _board = rotateMatrix(deepClone(board.value), rotations)

    const merges: number[] = []

    for (let row = startRow; row !== endRow; row += rowStep) {
      for (let col = startColumn; col !== endColumn; col += columnStep) {
        const merge = (i: number) => {
          if (row - i < 0)
            return

          const current = _board[row][col]
          const next = _board[row - i][col]

          if (current && next && current[0] !== -1 && current![0] === next![0] && !merges.includes(_board[row - i][col][1])) {
            _board[row - i][col]! = [_board[row][col]![0] * 2, _board[row][col]![1]]
            score.value += _board[row - i][col]![0]
            _board[row][col] = null
            merges.push(_board[row - i][col][1])

            if (_board[row - i][col]![0] === winningScore && !hasWon.value)
              hasWon.value = true

            return
          }
          else if (_board[row - i][col] !== null) { return }

          merge(i + 1)
        }

        merge(1)
      }
    }

    for (let row = startRow; row !== endRow; row += rowStep) {
      for (let col = startColumn; col !== endColumn; col += columnStep) {
        for (let i = row; i > 0; i--) {
          if (_board[i][col] !== null) {
            if (_board[i][col][0] === -1) {
              continue
            }
            if (_board[i - 1][col] === null) {
              _board[i - 1][col] = _board[i][col]
              _board[i][col] = null
            }
          }
        }
      }
    }

    _board = rotateMatrix(_board, 4 - rotations)

    if (!isArrayEqual(_board, board.value))
      _board = setRandomTile(_board)

    board.value = _board

    onMoveHook.trigger(direction)
  }

  const init = (_seed?: number, _size?: number, _obstacles?: number) => {
    isGameOver.value = false
    hasWon.value = false

    if (_size)
      size.value = _size

    if(_obstacles)
      obstacles.value = _obstacles

    if (_seed) {
      seed.value = _seed
      rand = createRandom(_seed)
    }

    let _board: Field = deepClone(defaultBoard.value)
    _board = setRandomTile(_board)
    _board = setRandomTile(_board)
    board.value = _board
    setObstacles(obstacles.value)
  }

  return {
    board,
    defaultBoard,
    boardItemsFlat,
    size,
    columns,
    obstacles,
    isGameOver,
    isGameWon,
    step,
    init,
    handleGameOver,
    handleGameRestart,
    onMove: onMoveHook.on,
    onRestart: onRestartHook.on,
  }
}
