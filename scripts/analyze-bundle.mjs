#!/usr/bin/env node

// Скрипт для анализа bundle размера и неиспользуемых зависимостей

import fs from 'fs';
import path from 'path';

// Цвета для консоли
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

// Функция для форматирования размера
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Анализ package.json
function analyzePackageJson() {
  const packagePath = path.join(process.cwd(), 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  console.log(`${colors.bold}${colors.blue}📦 АНАЛИЗ ЗАВИСИМОСТЕЙ${colors.reset}\n`);
  
  const dependencies = packageJson.dependencies || {};
  const devDependencies = packageJson.devDependencies || {};
  
  console.log(`${colors.green}Production зависимости (${Object.keys(dependencies).length}):${colors.reset}`);
  Object.entries(dependencies).forEach(([name, version]) => {
    console.log(`  • ${name}@${version}`);
  });
  
  console.log(`\n${colors.yellow}Development зависимости (${Object.keys(devDependencies).length}):${colors.reset}`);
  Object.entries(devDependencies).forEach(([name, version]) => {
    console.log(`  • ${name}@${version}`);
  });
  
  return { dependencies, devDependencies };
}

// Анализ импортов в коде
function analyzeImports() {
  console.log(`\n${colors.bold}${colors.blue}🔍 АНАЛИЗ ИМПОРТОВ${colors.reset}\n`);
  
  const srcDir = path.join(process.cwd(), 'src');
  const importStats = {};
  
  function scanDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        scanDirectory(filePath);
      } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.jsx') || file.endsWith('.js')) {
        analyzeFile(filePath);
      }
    });
  }
  
  function analyzeFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
      let match;
      
      while ((match = importRegex.exec(content)) !== null) {
        const importPath = match[1];
        
        // Игнорируем относительные импорты
        if (importPath.startsWith('.')) continue;
        
        // Извлекаем имя пакета
        const packageName = importPath.split('/')[0];
        
        if (!importStats[packageName]) {
          importStats[packageName] = {
            count: 0,
            files: new Set()
          };
        }
        
        importStats[packageName].count++;
        importStats[packageName].files.add(filePath);
      }
    } catch (error) {
      console.warn(`${colors.yellow}⚠️  Не удалось проанализировать файл: ${filePath}${colors.reset}`);
    }
  }
  
  scanDirectory(srcDir);
  
  // Сортируем по количеству использований
  const sortedImports = Object.entries(importStats)
    .sort(([,a], [,b]) => b.count - a.count);
  
  console.log(`${colors.green}Топ импортов:${colors.reset}`);
  sortedImports.slice(0, 20).forEach(([packageName, stats]) => {
    console.log(`  • ${packageName}: ${stats.count} использований в ${stats.files.size} файлах`);
  });
  
  return importStats;
}

// Рекомендации по оптимизации
function generateRecommendations(packageJson, importStats) {
  console.log(`\n${colors.bold}${colors.magenta}💡 РЕКОМЕНДАЦИИ ПО ОПТИМИЗАЦИИ${colors.reset}\n`);
  
  const recommendations = [];
  
  // Анализ больших библиотек
  const largeLibraries = {
    'lucide-react': 'Используйте индивидуальные импорты иконок',
    'framer-motion': 'Рассмотрите замену на более легкую альтернативу',
    '@radix-ui': 'Используйте tree shaking для Radix UI',
    'socket.io-client': 'Загружайте только на страницах где нужен',
    '@tanstack': 'Оптимизируйте конфигурацию кеширования',
    'axios': 'Рассмотрите замену на fetch API',
    'react-hook-form': 'Используйте tree shaking',
    'zod': 'Импортируйте только нужные схемы'
  };
  
  Object.entries(largeLibraries).forEach(([lib, recommendation]) => {
    // Проверяем как точное совпадение, так и частичное
    const isUsed = (packageJson.dependencies && packageJson.dependencies[lib]) || 
                   (importStats && importStats[lib]) || 
                   (importStats && Object.keys(importStats).some(key => key.includes(lib)));
    
    if (isUsed) {
      recommendations.push({
        library: lib,
        priority: 'high',
        recommendation: recommendation
      });
    }
  });
  
  // Анализ неиспользуемых зависимостей
  const unusedDeps = Object.keys(packageJson.dependencies || {}).filter(
    dep => !importStats[dep] && !dep.startsWith('@types/') && !dep.includes('@radix-ui')
  );
  
  if (unusedDeps.length > 0) {
    recommendations.push({
      library: 'Неиспользуемые зависимости',
      priority: 'medium',
      recommendation: `Удалите: ${unusedDeps.join(', ')}`
    });
  }
  
  // Выводим рекомендации
  recommendations.forEach((rec, index) => {
    const priorityColor = rec.priority === 'high' ? colors.red : 
                         rec.priority === 'medium' ? colors.yellow : colors.green;
    
    console.log(`${priorityColor}${index + 1}. ${rec.library}${colors.reset}`);
    console.log(`   ${rec.recommendation}\n`);
  });
  
  return recommendations;
}

// Основная функция
function main() {
  console.log(`${colors.bold}${colors.cyan}🚀 АНАЛИЗ BUNDLE РАЗМЕРА${colors.reset}\n`);
  
  try {
    const packageJson = analyzePackageJson();
    const importStats = analyzeImports();
    const recommendations = generateRecommendations(packageJson.dependencies, importStats);
    
    console.log(`${colors.bold}${colors.green}✅ Анализ завершен!${colors.reset}`);
    console.log(`\n${colors.blue}Для детального анализа bundle размера запустите:${colors.reset}`);
    console.log(`${colors.white}  npm run analyze${colors.reset}`);
    
  } catch (error) {
    console.error(`${colors.red}❌ Ошибка при анализе:${colors.reset}`, error.message);
    process.exit(1);
  }
}

// Запуск скрипта
if (require.main === module) {
  main();
}

module.exports = {
  analyzePackageJson,
  analyzeImports,
  generateRecommendations
};
