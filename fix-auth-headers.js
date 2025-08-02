const fs = require('fs');
const path = require('path');

function replaceJWTWithBearer(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        const originalContent = content;
        
        // Replace JWT with Bearer in authorization headers
        content = content.replace(/Authorization:\s*`JWT\s*\$\{([^}]+)\}`/g, 'Authorization: `Bearer ${$1}`');
        
        if (content !== originalContent) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Fixed: ${filePath}`);
            return true;
        }
        return false;
    } catch (error) {
        console.error(`Error processing ${filePath}:`, error.message);
        return false;
    }
}

function processDirectory(dirPath) {
    const items = fs.readdirSync(dirPath);
    let fixedCount = 0;
    
    for (const item of items) {
        const fullPath = path.join(dirPath, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            fixedCount += processDirectory(fullPath);
        } else if (item.endsWith('.ts') || item.endsWith('.tsx')) {
            if (replaceJWTWithBearer(fullPath)) {
                fixedCount++;
            }
        }
    }
    
    return fixedCount;
}

// Process API routes
console.log('Fixing API routes...');
const apiFixedCount = processDirectory('./src/app/api');
console.log(`Fixed ${apiFixedCount} API route files`);

// Process lib files
console.log('\nFixing lib files...');
const libFixedCount = processDirectory('./src/lib');
console.log(`Fixed ${libFixedCount} lib files`);

console.log(`\nTotal files fixed: ${apiFixedCount + libFixedCount}`);
