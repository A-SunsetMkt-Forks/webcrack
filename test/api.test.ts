import { readFile } from 'fs/promises';
import { join } from 'path';
import { describe, expect, test, vi } from 'vitest';
import { webcrack } from '../src';

const obfuscatedSrc = await readFile(
  join('test', 'samples', 'obfuscator.io.js'),
  'utf8'
);

const webpackSrc = await readFile(
  join('test', 'samples', 'webpack.js'),
  'utf8'
);

describe('options', () => {
  // BUG: crashes
  test.skip('no deobfuscate', async () => {
    await webcrack(webpackSrc, { deobfuscate: false });
  });

  test('no unpack', async () => {
    const result = await webcrack(webpackSrc, { unpack: false });
    expect(result.bundle).toBeUndefined();
  });

  test('no jsx', async () => {
    const result = await webcrack('React.createElement("div", null)', {
      jsx: false,
    });
    expect(result.code).toBe('React.createElement("div", null);');
  });

  test('custom sandbox', async () => {
    const sandbox = vi.fn((code: string) =>
      /* isolated-vm or something */ Promise.resolve(code)
    );
    await webcrack(obfuscatedSrc, { sandbox });
    expect(sandbox).toHaveBeenCalledOnce();
  });
});
