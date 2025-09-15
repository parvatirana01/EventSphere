interface EnvironmentConfig {
    apiUrl: string;
    appTitle: string;
    logLevel: 'debug' | 'info' | 'warn' | 'error';
    enableDevTools: boolean;
    enableConsoleLogs: boolean;
    isDevelopment: boolean;
    isProduction: boolean;
}
const getEnvironmentConfig =():EnvironmentConfig=>{
    const apiUrl = import.meta.env.VITE_API_URL;
    const appTitle = import.meta.env.VITE_APP_TITLE;
    const logLevel = import.meta.env.VITE_LOG_LEVEL;
    const enableDevTools = import.meta.env.VITE_ENABLE_REDUX_DEVTOOLS === 'true';
    const enableConsoleLogs = import.meta.env.VITE_ENABLE_CONSOLE_LOGS === 'true';

    const isDevelopment = import.meta.env.DEV;
    const isProduction = import.meta.env.PROD;

    if (!apiUrl) {
        throw new Error('VITE_API_URL environment variable is required');
    }

       
       const validLogLevels = ['debug', 'info', 'warn', 'error'];
       if (logLevel && !validLogLevels.includes(logLevel)) {
           throw new Error(`Invalid VITE_LOG_LEVEL: ${logLevel}. Must be one of: ${validLogLevels.join(', ')}`);
       }
       
       return {
           apiUrl,
           appTitle: appTitle || 'EventSphere',
           logLevel: (logLevel as any) || 'info',
           enableDevTools,
           enableConsoleLogs,
           isDevelopment,
           isProduction
       };
   
}
export const env = getEnvironmentConfig();
export const isDevelopment = () => env.isDevelopment;
export const isProduction = () => env.isProduction;
export const getApiUrl = () => env.apiUrl;

