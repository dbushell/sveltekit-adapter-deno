# sveltekit-adapter-deno

[Adapter](https://kit.svelte.dev/docs/adapters) for
[SvelteKit](https://kit.svelte.dev/) apps that generates a standalone
[Deno](https://deno.com/runtime) or [Deno Deploy](https://deno.com/deploy)
server.

## Usage

Install in your SvelteKit project:

```sh
npm install --save-dev sveltekit-adapter-deno
```

Add the adapter to your
[SvelteKit configuration](https://kit.svelte.dev/docs/configuration).

```js
// svelte.config.js
import adapter from "sveltekit-adapter-deno";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter(),
  },
};

export default config;
```

Build the app for production (`npm run build`).

Serve with Deno from the build directory:

```sh
deno run --allow-env --allow-read --allow-net mod.ts
```

For Deno Deploy set the entry point to `mod.ts`.

See the [GitHub Action workflow](/.github/workflows/ci.yml) for automated
deployment.

Using [deployctl](https://deno.com/deploy/docs/deployctl):

```sh
deployctl deploy --project=demo --import-map=import_map.json mod.ts
```

### Change the port or hostname

The following environment variables can be used to change the port and hostname:

```sh
PORT=5678 HOST=0.0.0.0 deno run --allow-env --allow-read --allow-net mod.ts
```

The default port is `8000` and the default hostname is `127.0.0.1`.

## Adapter options

See the [TypeScript definition](/index.d.ts) for `AdapterOptions`. You can
specify the build output directory and provide additional esbuild options.

The `usage` option is used to determine where the current directory is (this is
needed for the static and prerendered files). The default is `usage: 'deno'`
which uses the `import.meta.url` to get the current directory. If you want to
compile the result with `deno compile` you should use `usage: 'deno-compile'`
which uses `Deno.execPath()` to get the current directory.

## Node and NPM modules

Import Node modules in server routes with the `node:` prefix:

```js
import * as fs from "node:fs";
import { Buffer } from "node:buffer";
```

Import NPM modules as if coding for Node:

```js
import slugify from "@sindresorhus/slugify";
console.log(slugify("I ♥ Deno"));
```

## Demo App

This repo publishes a SvelteKit demo app to Deno Deploy at:

[sveltekit-adapter-deno.deno.dev](https://sveltekit-adapter-deno.deno.dev/)

---

[MIT License](/LICENSE) | Copyright © 2023 [David Bushell](https://dbushell.com)
