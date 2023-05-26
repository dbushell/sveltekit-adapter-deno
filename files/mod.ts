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

  // Path has trailing slash
  const slashed = pathname.at(-1) === '/';

  // Handle trailing slash redirects for prerendered routes
  const location = slashed ? pathname.slice(0, -1) : `${pathname}/`;
  if (prerendered.has(location)) {
    return new Response(null, {
      status: 308,
      statusText: 'Permanent Redirect',
      headers: {
        location
      }
    });
  }

  // Try prerendered route with html extension
  if (!slashed && !path.extname(pathname) && prerendered.has(pathname)) {
    const response = await serveFile(
      request,
      path.join(rootDir, `${pathname}.html`)
    );
    if (response.ok || response.status === 304) {
      return response;
    }
  }

  // Try static files (ignore redirects and errors)
  const response = await serveDir(request, serveDirOptions);
  if (response.ok || response.status === 304) {
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
