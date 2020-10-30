module.exports = {
  env: {
    commonjs: true,
    es2021: true,
    node: true,
  },
  parser: 'babel-eslint',
  extends: [
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 12,
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-empty': 'off',
    'operator-linebreak': 'off',
    'max-classes-per-file': 'off',
    'array-bracket-spacing': 'off',
    'padded-blocks': 'off',
    'arrow-parens': 'off',
    'no-restricted-syntax': 'off',
  },
};
