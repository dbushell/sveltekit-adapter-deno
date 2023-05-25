import {writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {build} from 'esbuild';

/** @type {import('.').default} */
export default function (opts = {}) {
  const {out = 'build', denoDeploy = false} = opts;

  return {
    name: 'deno-deploy-adapter',

    async adapt(builder) {
      const tmp = builder.getBuildDirectory('deno-deploy-adapter');

      builder.rimraf(out);
      builder.rimraf(tmp);
      builder.mkdirp(tmp);

      const outDir = `${out}/static/${builder.config.kit.paths.base}`;
      builder.writeClient(outDir);
      builder.writePrerendered(outDir);

      const dir = denoDeploy === true ? tmp : out;

      builder.writeServer(`${dir}/server`);

      const manifest = builder.generateManifest({
        relativePath: './'
      });

      writeFileSync(
        `${dir}/server/manifest.js`,
        `export const manifest = ${manifest};\n\nexport const prerendered = new Set(${JSON.stringify(
          builder.prerendered.paths
        )});\n`
      );

      const modPath = fileURLToPath(
        new URL('./files/mod.ts', import.meta.url).href
      );
      builder.copy(modPath, `${out}/mod.ts`, {});

      const denoPath = fileURLToPath(
        new URL('./files/deno.json', import.meta.url).href
      );
      builder.copy(denoPath, `${out}/deno.json`, {});

      const serverPath = fileURLToPath(
        new URL('./files/server.js', import.meta.url).href
      );
      builder.copy(serverPath, `${dir}/server.js`, {});

      if (denoDeploy) {
        build({
          entryPoints: [`${tmp}/server.js`],
          outfile: `${out}/server.js`,
          bundle: true,
          format: 'esm',
          target: 'esnext'
        }).catch((err) => {
          console.error(err);
          process.exit(1);
        });
      }
    }
  };
}
