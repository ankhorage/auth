import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { expect, test } from 'bun:test';

/*** Run a command and report its output when the packed-consumer boundary fails. */
const runAsync = async (command: string[], cwd: string): Promise<void> => {
  const process = Bun.spawn(command, { cwd, stderr: 'pipe', stdout: 'pipe' });
  const exitCode = await process.exited;

  if (exitCode === 0) return;

  throw new Error(
    `${command.join(' ')} failed:\n${await new Response(process.stdout).text()}${await new Response(process.stderr).text()}`,
  );
};

test('packed fresh consumer imports the root and capabilities entrypoints', async () => {
  const consumerDirectory = await mkdtemp(join(tmpdir(), 'ankhorage-auth-consumer-'));

  try {
    await runAsync(
      ['bun', 'pm', 'pack', '--destination', consumerDirectory, '--quiet'],
      process.cwd(),
    );
    const packedFiles = await Array.fromAsync(
      new Bun.Glob('*.tgz').scan({ cwd: consumerDirectory }),
    );
    const packedTarball = packedFiles.at(0);

    expect(packedTarball).toBeDefined();
    await writeFile(join(consumerDirectory, 'package.json'), '{"type":"module"}\n');
    await runAsync(['bun', 'add', `./${packedTarball}`], consumerDirectory);
    const packageManifestPath = join(
      consumerDirectory,
      'node_modules',
      '@ankhorage',
      'auth',
      'package.json',
    );
    const requireFromAuth = createRequire(packageManifestPath);
    expect(requireFromAuth.resolve('@ankhorage/capability')).toContain('@ankhorage/capability');
    const packageManifest = JSON.parse(await readFile(packageManifestPath, 'utf8')) as {
      readonly dependencies: Readonly<Record<string, string>>;
    };
    expect(packageManifest.dependencies['@ankhorage/capability']).toBe('0.2.1');
    await writeFile(
      join(consumerDirectory, 'consumer.ts'),
      `import type { AuthPort } from '@ankhorage/auth';
import { CAPABILITIES } from '@ankhorage/auth/capabilities';
import packageManifest from '@ankhorage/auth/package.json' with { type: 'json' };

type ConsumerAuthPort = AuthPort;
if (CAPABILITIES.length !== 9 || packageManifest.name !== '@ankhorage/auth') throw new Error('public entrypoint failed');
void (undefined as ConsumerAuthPort | undefined);
`,
    );
    await runAsync(['bun', 'consumer.ts'], consumerDirectory);
  } finally {
    await rm(consumerDirectory, { force: true, recursive: true });
  }
});
