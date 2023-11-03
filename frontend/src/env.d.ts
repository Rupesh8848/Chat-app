/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TEST: string;
  readonly VITE_APP_ID: string;
  readonly VITE_KEY: string;
  readonly VITE_SECRET: string;
  readonly VITE_CLUSTER: string;
  readonly VITE_SERVER_URL: string;

  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
