import type {ConnInfo, Handler} from 'server';
import * as path from 'path';
import {serve} from 'server';
import {serveDir, serveFile} from 'file_server';

import {manifest, prerendered} from './server/manifest.js';

import server from './server.js';

const initialized = server.init({env: Deno.env.toObject()});

const baseDir = path.dirname(new URL(import.meta.url).pathname);
const rootDir = path.join(baseDir, 'static');

const serveDirOptions = {
  fsRoot: rootDir,
  quiet: true
};

const handler: Handler = async (request: Request, context: ConnInfo) => {
  // Get client IP address
  const clientAddress =
    request.headers.get('x-forwarded-for') ??
    (context.remoteAddr as Deno.NetAddr).hostname;

  const {pathname} = new URL(request.url);

  // Try prerendered route without extension
  if (prerendered.has(pathname) && !path.extname(pathname)) {
    const response = await serveFile(
      request,
      path.join(rootDir, `${pathname}.html`)
    );
    if (response.ok) {
      return response;
    }
  }

  // Try static files
  const response = await serveDir(request, serveDirOptions);
  if (response.status === 301) {
    // Handle trailing slash redirects
    if (prerendered.has(`${pathname}/`)) {
      return response;
    }
  } else if (response.status < 400) {
    if (
      pathname.startsWith(`/${manifest.appDir}/immutable/`) &&
      response.status === 200
    ) {
      response.headers.set(
        'cache-control',
        'public, max-age=31536000, immutable'
      );
    }
    return response;
  }

  // Pass to the SvelteKit server
  await initialized;
  return server.respond(request, {
    platform: {context},
    getClientAddress: () => clientAddress
  });
};

serve(handler, {
  hostname: '0.0.0.0',
  port: 3000
});
