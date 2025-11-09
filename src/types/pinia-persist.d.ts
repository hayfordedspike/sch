import 'pinia'
import type { PiniaPluginContext, StateTree } from 'pinia'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type Persist<S extends StateTree = StateTree> = boolean | {
  key?: string
  storage?: Storage
  pick?: string[]
  omit?: string[]
  beforeHydrate?: (context: PiniaPluginContext) => void
  afterHydrate?: (context: PiniaPluginContext) => void
  debug?: boolean
}

declare module 'pinia' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface DefineStoreOptionsBase<S extends StateTree, Store> {
    persist?: Persist<S>
  }
}