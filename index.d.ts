import {Adapter} from '@sveltejs/kit';
import {BuildOptions} from 'esbuild';

interface AdapterOptions {
  out?: string;
  buildOptions?: BuildOptions;
}

export default function plugin(options?: AdapterOptions): Adapter;
