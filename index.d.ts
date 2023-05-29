import {Adapter} from '@sveltejs/kit';

interface AdapterOptions {
  out?: string;
}

export default function plugin(options?: AdapterOptions): Adapter;
