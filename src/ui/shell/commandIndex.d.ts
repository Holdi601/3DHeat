/** The side panel's index for the command palette, built from the source (tools/commandIndex.ts, served by vite.config.ts). */
declare module 'virtual:command-index' {
  const index: { entries: Array<{ tab: string; mode?: string; path: string[]; label?: string }> };
  export default index;
}
