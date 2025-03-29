import type { StateCreator } from 'zustand'

export const actionLogger = <T extends object>(config: StateCreator<T>): StateCreator<T> => {
  return (set, get, api) => {
    const state = config(set, get, api)
    // Iterate over all keys in the state and wrap functions to log their parameters
    Object.keys(state).forEach((key) => {
      const property = state[key as keyof T]
      if (typeof property === 'function') {
        const originalFn = property
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        state[key as keyof T] = ((...args: any[]) => {
          console.log(
            `%c [ACTION] ${key} called with arguments:`,
            'color: #03A9F4; font-weight: 700;',
            args
          )
          return originalFn(...args)
        }) as typeof property
      }
    })
    return state
  }
}
