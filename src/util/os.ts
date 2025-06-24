import appRootDir from 'app-root-dir';
import { env, platform } from 'process';
import path, { join, dirname } from 'path';
import { spawn, type ChildProcessWithoutNullStreams } from 'child_process';
import { openSync, PathLike } from 'fs';
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


export function executeBinary(binaryPath: string): ChildProcessWithoutNullStreams {
  // const execPath =
  //   env.name === 'production'
  //     ? join(dirname(appRootDir.get()), 'bin', getPlatform())
  //     : join(appRootDir.get(), 'resources', getPlatform());
  const execPath = join(appRootDir.get(), 'resources', getPlatform());

  const cmd = `${join(execPath, binaryPath)}`;
  console.info(`executing ${cmd}`);
  return spawn(cmd);
}

export async function createWorkdir(): Promise<PathLike> {
  return await fs.mkdtemp(path.join(os.tmpdir(), 'mlirdoc-'));
}