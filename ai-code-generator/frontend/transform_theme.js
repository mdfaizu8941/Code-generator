import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const mappings = {
  'bg-white': 'dark:bg-gray-900',
  'bg-gray-50': 'dark:bg-gray-950',
  'bg-gray-100': 'dark:bg-gray-800',
  'bg-gray-200': 'dark:bg-gray-700',
  'bg-gray-900': 'dark:bg-white',
  'text-gray-900': 'dark:text-white',
  'text-gray-800': 'dark:text-gray-200',
  'text-gray-700': 'dark:text-gray-300',
  'text-gray-600': 'dark:text-gray-400',
  'text-gray-500': 'dark:text-gray-500',
  'text-gray-400': 'dark:text-gray-500',
  'text-gray-300': 'dark:text-gray-600',
  'text-gray-200': 'dark:text-gray-700',
  'border-gray-200': 'dark:border-gray-800',
  'border-gray-300': 'dark:border-gray-700',
  'border-gray-400': 'dark:border-gray-600',
  'hover:bg-gray-50': 'dark:hover:bg-gray-800',
  'hover:bg-gray-100': 'dark:hover:bg-gray-700',
  'hover:text-gray-900': 'dark:hover:text-white',
  'hover:text-gray-800': 'dark:hover:text-gray-200',
  'hover:text-gray-600': 'dark:hover:text-gray-300',
  'hover:text-gray-500': 'dark:hover:text-gray-400',
  'from-gray-900': 'dark:from-gray-100',
  'to-gray-600': 'dark:to-gray-400',
  'bg-blue-50': 'dark:bg-blue-900/30',
  'border-blue-100': 'dark:border-blue-800/50',
  'bg-indigo-50': 'dark:bg-indigo-900/30',
  'border-indigo-100': 'dark:border-indigo-800/50',
  'text-indigo-700': 'dark:text-indigo-300',
  'ring-gray-100': 'dark:ring-gray-800',
  'bg-red-50': 'dark:bg-red-900/20'
};

const directories = ['src/components', 'src/pages'];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let originalContent = content;
  
  for (const [light, dark] of Object.entries(mappings)) {
    // Regex ensures we match exactly the class word
    // It avoids replacing if the dark equivalent is already present next to it
    const regex = new RegExp(`\\b${light}\\b(?!\\s+${dark})`, 'g');
    
    content = content.replace(regex, (match) => {
        return `${light} ${dark}`;
    });
  }
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Updated ${filePath}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      processFile(fullPath);
    }
  }
}

directories.forEach(dir => {
    const fullPath = path.join(process.cwd(), dir);
    if (fs.existsSync(fullPath)) walkDir(fullPath);
});

console.log('Transformation complete!');
