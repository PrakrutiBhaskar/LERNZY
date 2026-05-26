const js = require('@eslint/js');

module.exports = [
  {
    ignores: ["node_modules/", ".expo/", "dist/", "dist-audit/", "temp-app/"],
  },
  js.configs.recommended,
  {
    files: ["**/*.js", "**/*.jsx"],
    languageOptions: {
      globals: {
        __DEV__: "readonly",
        __dirname: "readonly",
        console: "readonly",
        jest: "readonly",
        module: "readonly",
        require: "readonly",
      },
    },
  },
];
