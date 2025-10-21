import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
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
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-require-imports": "error",
    },
  },
];

export default eslintConfig;
