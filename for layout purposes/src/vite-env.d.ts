/// <reference types="vite/client" />

declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

interface ImportMetaEnv {
  readonly VITE_GOOGLE_SHEETS_CSV_URL: string;
  readonly VITE_RELATED_PRODUCTS_CSV_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
