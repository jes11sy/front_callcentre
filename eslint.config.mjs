import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  ...nextVitals,
  ...nextTypescript,
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "scripts/**",
    ],
  },
  {
    rules: {
      // Отключаем предупреждения о неиспользуемых переменных для разработки
      "@typescript-eslint/no-unused-vars": ["warn", { 
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_",
        "ignoreRestSiblings": true 
      }],
      
      // Отключаем предупреждения о React Hooks зависимостях (часто ложные срабатывания)
      "react-hooks/exhaustive-deps": "warn",
      
      // Отключаем предупреждения о Next.js Image (можно исправить позже)
      "@next/next/no-img-element": "warn",
      
      // Отключаем предупреждения о анонимных экспортах
      "import/no-anonymous-default-export": "warn",
      
      // Строгие правила для ошибок
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-require-imports": "error",

      // React Compiler rules are enabled by Next 16 presets and currently
      // produce many legacy-code blockers. Keep them visible as warnings
      // while we migrate code incrementally.
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/static-components": "warn",
      "react-hooks/refs": "warn",
      "react-hooks/purity": "warn",
      "react-hooks/incompatible-library": "warn",
      "react-hooks/preserve-manual-memoization": "warn",
    },
  },
];

export default eslintConfig;
