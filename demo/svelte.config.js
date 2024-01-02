import adapter from 'sveltekit-adapter-deno';
import {vitePreprocess} from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({
      buildOptions: {
        banner: {
          js: `/* Build time: ${new Date().toISOString()} */`
        }
      }
    })
  }
};

export default config;
