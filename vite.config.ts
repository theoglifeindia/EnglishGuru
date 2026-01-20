
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  // Cast process to any to avoid "Property 'cwd' does not exist on type 'Process'" error if types are missing
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [react()],
    build: {
      outDir: 'dist',
    },
    define: {
      // Polyfill process.env.API_KEY with the value from environment variables
      // Checks both API_KEY and VITE_API_KEY to be robust
      'process.env.API_KEY': JSON.stringify(env.API_KEY || env.VITE_API_KEY),
    }
  };
});
