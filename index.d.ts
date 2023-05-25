import {Adapter} from '@sveltejs/kit';
import './ambient.js';

interface AdapterOptions {
  out?: string;
  denoDeploy?: Boolean;
}

export default function plugin(options?: AdapterOptions): Adapter;
