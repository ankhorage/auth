export default {
  mode: 'write',
  docs: {
    title: 'Ankhorage Auth',
    description: 'Provider-neutral authentication ports and capability catalog for Ankhorage.',
  },
  package: {
    entrypoints: ['src/index.ts', 'src/capabilities/index.ts'],
  },
  output: {
    dir: 'paradox',
  },
};
