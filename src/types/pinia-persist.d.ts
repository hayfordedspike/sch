/* eslint-disable @typescript-eslint/no-unused-vars */
import 'pinia'
import type { Store } from 'pinia'

interface PersistedStateOptions {
  key?: string
  pick?: string[]
  paths?: string[]
  storage?: Storage
  afterRestore?: (context: {
    store: Record<string, unknown>
    [key: string]: unknown
  }) => void
}

declare module 'pinia' {
  export interface DefineSetupStoreOptions<Id extends string, SS, S, A> {
    persist?: PersistedStateOptions | boolean
  }
  
  export interface DefineStoreOptions<Id extends string, S, G, A> {
    persist?: PersistedStateOptions | boolean
  }
}