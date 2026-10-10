import { readFile, writeFile } from 'node:fs/promises';

import { CAPABILITIES } from '../src/capabilities/index.js';

/*** Materialize the canonical capability catalog into published package metadata. */
const materializePackageCapabilitiesAsync = async (): Promise<void> => {
  const packageFile = new URL('../package.json', import.meta.url);
  const packageManifest = JSON.parse(await readFile(packageFile, 'utf8')) as Record<
    string,
    unknown
  >;
  const ankh = (packageManifest.ankh ?? {}) as Record<string, unknown>;

  await writeFile(
    packageFile,
    `${JSON.stringify({ ...packageManifest, ankh: { ...ankh, capabilities: CAPABILITIES } }, null, 2)}\n`,
  );
};

await materializePackageCapabilitiesAsync();
