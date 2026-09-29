import * as migration_20260928_180805_initial from './20260928_180805_initial';

export const migrations = [
  {
    up: migration_20260928_180805_initial.up,
    down: migration_20260928_180805_initial.down,
    name: '20260928_180805_initial'
  },
];
