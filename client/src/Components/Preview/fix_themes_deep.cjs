const fs = require('fs');
const path = require('path');

const directoryPath = __dirname;

fs.readdir(directoryPath, function (err, files) {
  if (err) return console.log('Unable to scan directory: ' + err);

  files.forEach(function (file) {
    if (file.endsWith('.jsx')) {
      const filePath = path.join(directoryPath, file);
      let content = fs.readFileSync(filePath, 'utf8');
      
      let modified = false;

      // Dark background replacements (bg-[#1...], bg-[#2...], bg-[#3...], bg-[#4...])
      // Using bg-slate-50 for light mode
      const bgRegex = /(?<!dark:)(bg-\[#[0-4][a-fA-F0-9]{5}\])/g;
      if (bgRegex.test(content)) {
        content = content.replace(bgRegex, "bg-slate-50 dark:$1");
        modified = true;
      }

      // Dark border replacements
      const borderRegex = /(?<!dark:)(border-\[#[0-8][a-fA-F0-9]{5}\])/g;
      if (borderRegex.test(content)) {
        content = content.replace(borderRegex, "border-slate-200 dark:$1");
        modified = true;
      }

      // Text colors that are light (white, gray-300, gray-400, etc)
      // text-white -> text-slate-900 dark:text-white
      // text-gray-400 -> text-slate-600 dark:text-gray-400
      // text-gray-300 -> text-slate-700 dark:text-gray-300
      // text-slate-300 -> text-slate-700 dark:text-slate-300
      
      const textWhiteRegex = /(?<!dark:)\btext-white\b/g;
      if (textWhiteRegex.test(content)) {
        content = content.replace(textWhiteRegex, "text-slate-900 dark:text-white");
        modified = true;
      }

      const textGray400Regex = /(?<!dark:)\btext-gray-400\b/g;
      if (textGray400Regex.test(content)) {
        content = content.replace(textGray400Regex, "text-slate-600 dark:text-gray-400");
        modified = true;
      }

      const textGray300Regex = /(?<!dark:)\btext-gray-300\b/g;
      if (textGray300Regex.test(content)) {
        content = content.replace(textGray300Regex, "text-slate-700 dark:text-gray-300");
        modified = true;
      }

      const textSlate300Regex = /(?<!dark:)\btext-slate-300\b/g;
      if (textSlate300Regex.test(content)) {
        content = content.replace(textSlate300Regex, "text-slate-700 dark:text-slate-300");
        modified = true;
      }

      // fill-white and stroke-white for icons
      const fillWhiteRegex = /(?<!dark:)\bfill-white\b/g;
      if (fillWhiteRegex.test(content)) {
        content = content.replace(fillWhiteRegex, "fill-slate-900 dark:fill-white");
        modified = true;
      }

      if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${file}`);
      }
    }
  });
});
