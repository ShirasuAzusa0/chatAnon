export default {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended', // ESLint 推荐规则
    'plugin:react/recommended', // React 推荐规则
    'plugin:react-hooks/recommended', // React Hooks 推荐规则
    'plugin:prettier/recommended', // 关键：结合 Prettier，避免冲突
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['react', 'react-hooks', 'prettier'],
  rules: {
    'prettier/prettier': 'warn', // 让 prettier 格式问题以警告的形式提示
    'react/react-in-jsx-scope': 'off', // 在 React 17+ 不需要 import React
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
