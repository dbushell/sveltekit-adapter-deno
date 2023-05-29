import {fileURLToPath} from 'node:url';
import {build} from 'esbuild';

/** @type {import('.').default} */
export default function (opts = {}) {
  const {out = 'build', imports = {}} = opts;

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

      builder.writeServer(`${out}/server`);

      const denoPath = fileURLToPath(new URL('./files', import.meta.url).href);
      builder.copy(denoPath, `${out}`, {});

      const modPath = fileURLToPath(
        new URL('./files/mod.ts', import.meta.url).href
      );
      builder.copy(modPath, `${out}/mod.ts`, {
        replace: {
          SERVER: './server.js',
          APP_DIR: builder.getAppPath(),
          PRERENDERED: JSON.stringify(builder.prerendered.paths)
        }
      });

      try {
        await build({
          entryPoints: [`${out}/server.js`],
          outfile: `${out}/server.js`,
          bundle: true,
          format: 'esm',
          target: 'esnext',
          platform: 'node',
          allowOverwrite: true
        });
      } catch (err) {
        console.error(err);
        process.exit(1);
      } finally {
        builder.rimraf(`${out}/server`);
      }
    }
  };
}
