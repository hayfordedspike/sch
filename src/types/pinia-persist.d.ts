/* eslint-disable @typescript-eslint/no-unused-vars */
import 'pinia'

declare module 'pinia' {
  export interface DefineSetupStoreOptions<Id extends string, SS, S, A> {
    persist?: {
      key?: string
      pick?: (keyof S)[]
      storage?: Storage
    }
  }
}