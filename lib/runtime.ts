import type { InflateFn } from './types';

const getCurrentRuntime = () => {
  const globalObj = globalThis as Record<string, unknown>;
  if (globalObj.Bun) return 'bun';
  if (globalObj.Deno) return 'deno';
  if (typeof process === 'object') return 'node';
  return 'browser';
};

export const getInflateFnByRuntime = async (): Promise<InflateFn> => {
  switch (getCurrentRuntime()) {
    case 'bun':
      return Bun.inflateSync;

    case 'node':
      // eslint-disable-next-line no-case-declarations
      const { inflateRawSync } = await import('node:zlib');
      return inflateRawSync;

    default:
      throw new Error('Not implemented yet');
  }
};
