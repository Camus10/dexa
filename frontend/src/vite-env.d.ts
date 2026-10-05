/// <reference types="vite/client" />

/**
 * Import SVG sebagai React component.
 *
 * vite-plugin-svgr di vite.config.ts disetel `exportType: "named"` dan
 * `namedExport: "ReactComponent"`, jadi berkas `*.svg?react` menyediakan
 * named export `ReactComponent` (dipakai di src/icons/index.ts) sekaligus
 * default export sebagai cadangan.
 */
declare module "*.svg?react" {
  import type { FunctionComponent, SVGProps } from "react";

  export const ReactComponent: FunctionComponent<SVGProps<SVGSVGElement>>;
  const defaultExport: FunctionComponent<SVGProps<SVGSVGElement>>;
  export default defaultExport;
}

