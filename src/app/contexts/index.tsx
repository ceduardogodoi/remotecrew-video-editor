'use client'

import { PropsWithChildren, createContext, useContext, useState } from 'react'

interface AppContext {
  sentenceIndex: number
  updateSentenceIndex(time: number): void
}

const initialState = {
  sentenceIndex: 0,
  updateSentenceIndex(index: number) {
    this.sentenceIndex = index
  }
} as AppContext

const AppContext = createContext(initialState)

export function AppContextProvider({ children }: PropsWithChildren) {
  const [sentenceIndex, setCurrentSentenceIndex] = useState(0)

  function updateSentenceIndex(time: number) {
    setCurrentSentenceIndex(time)
  }

  return (
    <AppContext.Provider value={{
      sentenceIndex: sentenceIndex,
      updateSentenceIndex,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext() {
  return useContext(AppContext)
}
