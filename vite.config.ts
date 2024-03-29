import { defineConfig } from "vite";
import { viteStaticCopy } from 'vite-plugin-static-copy'
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { getAliases } from "vite-aliases";
import autoPreprocess from 'svelte-preprocess';

const aliases = getAliases();

// https://vitejs.dev/config/
export default defineConfig({
  // Compilation workaround due to customElement affecting all files during compilation
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: 'node_modules/@ionic/core/dist',
          dest: 'ionic-core'
        }
      ]
    }),
    // Compile Web Components
    svelte({
      preprocess: autoPreprocess(),
      // @ts-ignore
      include: /\.wc\.svelte$/,
      compilerOptions: {
        customElement: true,
      },
    }),
    // Compile Normal Svelte
    svelte({
      preprocess: autoPreprocess(),
      // @ts-ignore
      exclude: /\.wc\.svelte$/,
      compilerOptions: {
        customElement: false,
      },
    }),
  ],
  publicDir: "./assets/",
  build: {
    outDir: "./public/",
    rollupOptions: {
      external: [
        '/ionic-core/dist/ionic/ionic.esm.js',
        '/ionic-core/dist/ionic/ionic.js'
      ]
    }
  },
  resolve: {
    alias: aliases,
  },
  optimizeDeps: { exclude: ["@roxi/routify", "@urql/svelte", "fsevents"] },
});
