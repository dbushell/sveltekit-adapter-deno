import {vitePreprocess} from '@sveltejs/kit/vite';
import adapter from 'sveltekit-adapter-deno';

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
