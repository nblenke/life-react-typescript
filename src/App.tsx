import React, {
  createContext,
  Fragment,
  FunctionComponent,
  useCallback,
  useEffect,
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

let tick: any

const updateCells = (cells: any) =>
  cells.map((cell: any) => {
    const {id} = cell
    const rowLength = 20
    const top = cells[id - rowLength]
    const topLeft = cells[id - rowLength - 1]
    const topRight = cells[id - rowLength + 1]
    const left = cells[id - 1]
    const bottom = cells[id + rowLength]
    const bottomLeft = cells[id + rowLength - 1]
    const bottomRight = cells[id + rowLength + 1]
    const right = cells[id + 1]

    let neighborLength = 0
    let living

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

const setRandomLiving = (cells: any, killAll: boolean) =>
  cells.map((cell: any) => {
    return {
      id: cell.id,
      living: killAll ? false : Math.round(Math.random()) === 1,
    }
  })

const App: FunctionComponent = () => {
  const [, updateState] = useState()
  const forceUpdate = useCallback(() => updateState({}), [])
  let [cells, setCells] = useState<CellInterface[]>([])
  const [paused, setPaused] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)
  const AppContextValue = useMemo(() => ({cells, setCells}), [cells])

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

  const startTick = () => {
    tick = setInterval(() => {
      cells = updateCells(cells)
      setCells(cells)
    }, 1000)
  }

  const stopTick = () => {
    clearInterval(tick)
  }

  const handleStartClick = () => {
    setGameStarted(true)
    cells = setRandomLiving(cells, false)
    setCells(cells)
    startTick()
  }

  const handleResetClick = () => {
    setPaused(false)
    setGameStarted(false)
    cells = setRandomLiving(cells, true)
    setCells(cells)
    stopTick()
  }

  const handleCellClick = (id: any) => {
    cells[id].living = !cells[id].living
    setCells(cells)
    forceUpdate()
  }

  const handlePlayClick = () => {
    setPaused(!paused)

    if (paused) {
      startTick()
    } else {
      stopTick()
    }
  }

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
                className={`cell ${living ? 'living' : ''}`}
                key={`cell-${id}`}
                onClick={() => handleCellClick(id)}
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
