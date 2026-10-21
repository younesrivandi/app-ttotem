const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

// Preserve the SDK 54 lint baseline during the SDK 57 migration. The newer
// React Compiler rules require a separate behavior-reviewed refactor of
// existing interactive game components, not automated changes in an SDK bump.
module.exports = defineConfig([
  expoConfig,
  {
    rules: {
      'react-hooks/refs': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/purity': 'off',
      'react-hooks/immutability': 'off',
    },
  },
  { ignores: ['dist/*', '.expo/*'] },
]);
