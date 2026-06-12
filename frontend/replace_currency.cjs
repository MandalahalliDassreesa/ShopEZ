const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    if (fs.statSync(file).isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.jsx')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('C:/Users/DASA/OneDrive/Desktop/PROJECT/frontend/src');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Safe replacements for currency $ in JSX
  // Case 1: >$ { or >${
  content = content.replace(/>\s*\$(\s*\{)/g, '>₹$1');
  // Case 2: >$10 or >$ 10
  content = content.replace(/>\s*\$(\s*\d)/g, '>₹$1');
  // Case 3: "$ " or ": $" (inside text or objects but not backticks)
  content = content.replace(/(Price Range|Price|Total|Subtotal|Shipping|Discount) \(\$\)/g, '$1 (₹)');
  content = content.replace(/(Price Range|Price|Total|Subtotal|Shipping|Discount):\s*\$(\{?)/g, '$1: ₹$2');
  content = content.replace(/:\s*'\$'/g, ": '₹'");
  content = content.replace(/:\s*"\$"/g, ': "₹"');
  
  // Manual string replacements where necessary (e.g. template literals that output currency)
  // `Total: $${amount}` => `Total: ₹${amount}`
  content = content.replace(/Total: \$\$\{/g, 'Total: ₹${');
  content = content.replace(/Price: \$\$\{/g, 'Price: ₹${');

  fs.writeFileSync(file, content, 'utf8');
});
console.log('Currency replacement done!');
