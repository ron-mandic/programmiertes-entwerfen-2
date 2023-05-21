/// <reference types="vite/client" />

// see https://vitejs.dev/guide/env-and-mode.html
interface ImportMetaEnv {
	readonly VITE_APP_TITLE: string;
	// ...
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
