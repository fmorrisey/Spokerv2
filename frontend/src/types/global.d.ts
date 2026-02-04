// Runtime environment configuration injected via env.js
interface RuntimeEnv {
  API_URL?: string;
  ENABLE_ANALYTICS?: string | boolean;
  ENABLE_DEBUG?: string | boolean;
}

declare global {
  interface Window {
    __env?: RuntimeEnv;
  }
}

export {};
