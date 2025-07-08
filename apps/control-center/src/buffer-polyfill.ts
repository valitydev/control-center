import { Buffer } from 'buffer';

// TODO: Remove buffer polyfill after fix domain proto generation
(globalThis as unknown as { Buffer: typeof Buffer }).Buffer = Buffer;
