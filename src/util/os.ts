import { platform } from 'process';
import path from 'path';
import { PathLike } from 'fs';
import fs from 'fs/promises';
import os from 'os';

export type OSIdentifier = 'linux' | 'mac' | 'win';

export function getPlatform(): OSIdentifier {
  switch (platform) {
    case 'aix':
    case 'freebsd':
    case 'linux':
    case 'openbsd':
    case 'android':
      return 'linux';
    case 'darwin':
    case 'sunos':
      return 'mac';
    case 'win32':
      return 'win';
  }
  throw new Error("unhandled platform");
};

export async function createWorkdir(): Promise<PathLike> {
  return await fs.mkdtemp(path.join(os.tmpdir(), 'mlirdoc-'));
}