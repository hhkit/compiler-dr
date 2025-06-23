import appRootDir from 'app-root-dir';
import { env, platform } from 'process';
import { join, dirname } from 'path';
import { spawn, type ChildProcessWithoutNullStreams } from 'child_process';

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
