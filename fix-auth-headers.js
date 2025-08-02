const fs = require('fs');
const path = require('path');

function findAndReplaceInFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const updatedContent = content.replace(/Authorization: `JWT \$\{/g, 'Authorization: `Bearer ${');
    
    if (content !== updatedContent) {
      fs.writeFileSync(filePath, updatedContent, 'utf8');
      console.log(`Updated: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return false;
  }
}

function walkDirectory(dir) {
  const files = fs.readdirSync(dir);
  let updatedCount = 0;

  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      updatedCount += walkDirectory(fullPath);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      if (findAndReplaceInFile(fullPath)) {
        updatedCount++;
      }
    }
  });

  return updatedCount;
}

console.log('Starting JWT to Bearer token replacement...');
const updatedFiles = walkDirectory('./src');
console.log(`\nCompleted! Updated ${updatedFiles} files.`);
