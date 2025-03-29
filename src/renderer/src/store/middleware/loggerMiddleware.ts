import { StateCreator } from 'zustand'

const logger =
  <T extends object>(config: StateCreator<T>): StateCreator<T> =>
  (set, get, api) =>
    config(
      (partial, replace) => {
        const previousState = get()
        console.log('%c PREV STATE', 'color: #9E9E9E; font-weight: 700;', previousState)
        // Update the state
        set(partial, replace)
        console.log('%c NEXT STATE', 'color: #4CAF50; font-weight: 700;', get())
      },
      get,
      api
    )

export default logger
