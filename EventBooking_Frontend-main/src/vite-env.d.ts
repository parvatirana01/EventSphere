/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_URL: string;
    readonly VITE_APP_TITLE?: string;
    readonly VITE_LOG_LEVEL?: 'debug' | 'info' | 'warn' | 'error';
    readonly VITE_ENABLE_REDUX_DEVTOOLS?: 'true' | 'false';
    readonly VITE_ENABLE_CONSOLE_LOGS?: 'true' | 'false';
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
