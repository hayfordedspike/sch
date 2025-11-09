// Type declarations for importing .vue files
declare module '*.vue' {
  import { DefineComponent } from 'vue'
  // Use safer types to satisfy lint rules
  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>
  export default component
}
