import React, {
  createContext,
  Fragment,
  FunctionComponent,
  useCallback,
  useEffect,
  useRef,
  useState,
  useMemo,
} from 'react'
import './App.scss'

interface CellInterface {
  id: number
  living: boolean
}

interface IUserInterfaceContext {
  cells: CellInterface[]
  setCells: React.Dispatch<React.SetStateAction<CellInterface[]>>
}

export const AppContext = createContext<IUserInterfaceContext>({
  cells: [],
  setCells: function () {},
})

const updateCells = (cells: CellInterface[]): CellInterface[] =>
  cells.map((cell: CellInterface) => {
    const {id} = cell
    const rowLength = 20
    const height = cells.length / rowLength
    const curCol = id % rowLength
    const curRow = Math.floor(id / rowLength)
    const prevCol = (curCol + rowLength - 1) % rowLength
    const nextCol = (curCol + rowLength + 1) % rowLength
    const prevRow = curRow === 0 ? height - 1 : curRow - 1
    const nextRow = curRow === height - 1 ? 0 : curRow + 1
    const top = cells[prevRow * rowLength + curCol]
    const topLeft = cells[prevRow * rowLength + prevCol]
    const topRight = cells[prevRow * rowLength + nextCol]
    const left = cells[curRow * rowLength + prevCol]
    const bottom = cells[nextRow * rowLength + curCol]
    const bottomLeft = cells[nextRow * rowLength + prevCol]
    const bottomRight = cells[nextRow * rowLength + nextCol]
    const right = cells[curRow * rowLength + nextCol]

    let neighborLength = 0
    let living = cell.living

    if (top && top.living) {
      neighborLength += 1
    }
    if (topLeft && topLeft.living) {
      neighborLength += 1
    }
    if (topRight && topRight.living) {
      neighborLength += 1
    }
    if (left && left.living) {
      neighborLength += 1
    }
    if (bottom && bottom.living) {
      neighborLength += 1
    }
    if (bottomLeft && bottomLeft.living) {
      neighborLength += 1
    }
    if (bottomRight && bottomRight.living) {
      neighborLength += 1
    }
    if (right && right.living) {
      neighborLength += 1
    }

    // If a dead cell has exactly three live neighbours, it comes to life
    if (!cell.living && neighborLength === 3) {
      living = true
    }

    // If a live cell has less than two live neighbours, it dies
    if (cell.living && neighborLength < 2) {
      living = false
    }

    // If a live cell has more than three live neighbours, it dies
    if (cell.living && neighborLength > 3) {
      living = false
    }

    // If a live cell has two or three live neighbours, it continues living
    if (cell.living && (neighborLength === 2 || neighborLength === 3)) {
      living = true
    }

    return {
      id: cell.id,
      living,
    }
  })

const App: FunctionComponent = () => {
  const [cells, setCells] = useState<CellInterface[]>([])
  const [paused, setPaused] = useState(false)
  const [userInteractionBeforeStart, setUserInteractionBeforeStart] = useState(
    false
  )
  const [gameStarted, setGameStarted] = useState(false)
  const AppContextValue = useMemo(() => ({cells, setCells}), [cells])
  const cellRef = useRef(cells)
  const intervalRef = useRef<number>()
  const speed = 1000

  useEffect(() => {
    const arr = []
    for (let i = 0; i <= 399; i += 1) {
      arr.push({
        id: i,
        living: false,
      })
    }

    setCells(arr)
  }, [])

  const startTick = useCallback(() => {
    const id = window.setInterval(() => {
      cellRef.current = updateCells(cellRef.current)
      setCells(cellRef.current)
    }, speed)

    intervalRef.current = id
  }, [speed])

  const stopTick = useCallback(() => {
    window.clearInterval(intervalRef.current)
  }, [intervalRef])

  const handleStartClick = useCallback(() => {
    setGameStarted(true)
    startTick()

    if (userInteractionBeforeStart) {
      return
    }

    cellRef.current = cells.map(({id}) => {
      return {
        id,
        living: Math.round(Math.random()) === 1,
      }
    })
    setCells(cellRef.current)
  }, [cells])

  const handleResetClick = useCallback(() => {
    setUserInteractionBeforeStart(false)
    setPaused(false)
    setGameStarted(false)
    stopTick()

    cellRef.current = cells.map(({id}) => {
      return {
        id,
        living: false,
      }
    })
    setCells(cellRef.current)
  }, [cells])

  const handleCellClick = useCallback(
    (ev: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      const button = ev.target as HTMLButtonElement
      const idString = button.dataset.cellId

      if (idString === undefined) {
        return
      }

      const id = Number.parseInt(idString)

      if (!gameStarted) {
        setUserInteractionBeforeStart(true)
      }

      const newCells = [...cells]
      newCells[id].living = !newCells[id].living
      setCells(newCells)
    },
    [cells, gameStarted]
  )

  const handlePlayClick = useCallback(() => {
    setPaused(!paused)

    if (paused) {
      startTick()
    } else {
      stopTick()
    }
  }, [paused])

  return (
    <AppContext.Provider value={AppContextValue}>
      <div className="app">
        <div className="header">Conway's Life</div>

        <div className="actions">
          {!gameStarted ? (
            <button className="button" onClick={handleStartClick}>
              Start
            </button>
          ) : (
            <Fragment>
              <button className="button" onClick={handleResetClick}>
                Reset
              </button>
              <button className="button" onClick={handlePlayClick}>
                {paused ? 'Resume' : 'Pause'}
              </button>
            </Fragment>
          )}
        </div>

        <div className="board-wrap">
          <div className="board">
            {cells.map(({id, living}) => (
              <button
                data-cell-id={id}
                className={`cell ${living ? 'living' : ''}`}
                key={`cell-${id}`}
                onClick={handleCellClick}
              >
                {id}
                <div className="cell-inner" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </AppContext.Provider>
  )
}

export default App
