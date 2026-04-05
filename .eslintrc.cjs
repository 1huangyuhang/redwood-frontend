module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'prettier',
  ],
  ignorePatterns: [
    'dist',
    'dist-management',
    'management/dist',
    'storybook-static',
    'coverage',
    'backend/coverage',
    '**/*.min.js',
    '.eslintrc.cjs',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh', 'prettier'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    'prettier/prettier': 'error',
    '@typescript-eslint/no-explicit-any': 'off',
  },
  overrides: [
    /** Express、Prisma、脚本：Node 全局，避免误报 no-undef */
    {
      files: ['backend/**/*.ts'],
      env: { node: true },
    },
    {
      files: [
        'backend/**/__tests__/**/*.ts',
        '**/*.test.ts',
        '**/*.test.tsx',
        'src/setupTests.ts',
      ],
      env: { node: true, jest: true },
    },
    /** Jest manual mocks：CommonJS module.exports */
    {
      files: ['**/__mocks__/**/*.js', 'jest.config.cjs', 'management/jest.config.cjs'],
      env: { node: true },
    },
    /** 管理端与官网：明确浏览器环境（与根配置一致，便于后续拆 root env） */
    {
      files: ['management/**/*.{ts,tsx}', 'src/**/*.{ts,tsx}'],
      env: { browser: true },
    },
  ],
};
