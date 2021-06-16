import React, { createContext } from 'react'
import SocketManager from './SocketManager'

const initialState = {
  socketManager: new SocketManager()
}

export const Context = createContext(initialState)

export type GlobalStoreProps = {
  children: React.ReactNode
}

export default function GlobalStore({ children }: GlobalStoreProps) {
  return <Context.Provider value={initialState}>
    {children}
  </Context.Provider>
}