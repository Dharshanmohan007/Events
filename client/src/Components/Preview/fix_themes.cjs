const fs = require('fs');
const path = require('path');

const directoryPath = __dirname;

const replacements = [
  { regex: /bg-\[\#161B2D\]/g, replacement: "bg-white dark:bg-[#161B2D]" },
  { regex: /bg-\[\#20263B\]/g, replacement: "bg-slate-50 dark:bg-[#20263B]" },
  { regex: /border-\[\#2E3652\]/g, replacement: "border-slate-200 dark:border-[#2E3652]" },
  { regex: /border-\[\#343C59\]/g, replacement: "border-slate-200 dark:border-[#343C59]" },
  { regex: /border-\[\#8e93a6\]/g, replacement: "border-slate-300 dark:border-[#8e93a6]" },
  { regex: /bg-\[\#2E3652\]/g, replacement: "bg-slate-200 dark:bg-[#2E3652]" },
  { regex: /\btext-white\b/g, replacement: "text-slate-900 dark:text-white" },
  { regex: /\btext-gray-400\b/g, replacement: "text-slate-500 dark:text-gray-400" },
  { regex: /\btext-gray-300\b/g, replacement: "text-slate-600 dark:text-gray-300" }
];

fs.readdir(directoryPath, function (err, files) {
  if (err) {
    return console.log('Unable to scan directory: ' + err);
  } 

  files.forEach(function (file) {
    if (file.endsWith('.jsx') || file.endsWith('.js')) {
      if (file === 'fix_themes.js') return;

      const filePath = path.join(directoryPath, file);
      let content = fs.readFileSync(filePath, 'utf8');
      
      let modified = false;
      replacements.forEach(({ regex, replacement }) => {
        if (regex.test(content)) {
          content = content.replace(regex, replacement);
          modified = true;
        }
      });

      if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${file}`);
      }
    }
  });
});
