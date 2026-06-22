// ESLint config ל-Expo (eslint 8 / eslintrc) — נדרש ע"י lint-staged ב-pre-commit.
module.exports = {
  root: true,
  extends: 'expo',
  ignorePatterns: ['dist', 'node_modules', '.expo', 'web-shims', 'expo-env.d.ts'],
  overrides: [
    {
      // קבצי קונפיג של Node (metro/babel/tailwind/eslint) — סביבת Node, לא דפדפן
      files: ['*.config.js', '.eslintrc.js'],
      env: { node: true },
    },
  ],
};
