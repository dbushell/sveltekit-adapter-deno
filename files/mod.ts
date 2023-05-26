import type {ConnInfo, Handler} from 'server';
import * as path from 'path';
import {serve} from 'server';
import {serveDir} from 'file_server';

import server from './server.js';

const initialized = server.init({env: Deno.env.toObject()});

const baseDir = path.dirname(new URL(import.meta.url).pathname);
const rootDir = path.join(baseDir, 'static');

const handler: Handler = async (request: Request, context: ConnInfo) => {
  // Get client IP address
  const clientAddress =
    request.headers.get('x-forwarded-for') ??
    (context.remoteAddr as Deno.NetAddr).hostname;

  // Try static files
  const response = await serveDir(request, {
    fsRoot: rootDir,
    quiet: true
  });
  if (response && (response.ok || response.status < 400)) {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/_app/immutable/')) {
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
