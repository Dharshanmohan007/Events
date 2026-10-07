const fs = require('fs');

function processPreview(file) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/bg-\[\#252C3F\]/g, 'bg-white dark:bg-[#252C3F]');
  content = content.replace(/bg-\[\#1E2435\]/g, 'bg-white dark:bg-[#1E2435]');
  content = content.replace(/bg-\[\#1C2233\]/g, 'bg-white dark:bg-[#1C2233]');
  content = content.replace(/bg-\[\#2A3042\]/g, 'bg-white dark:bg-[#2A3042]');
  
  content = content.replace(/border-\[\#343C59\]/g, 'border-slate-200 dark:border-[#343C59]');
  content = content.replace(/border-\[\#394156\]/g, 'border-slate-200 dark:border-[#394156]');
  content = content.replace(/border-\[\#3B435A\]/g, 'border-slate-200 dark:border-[#3B435A]');
  content = content.replace(/border-\[\#434A60\]/g, 'border-slate-200 dark:border-[#434A60]');
  
  fs.writeFileSync(file, content, 'utf8');
  console.log('Processed ' + file);
}

const files = [
  'src/Components/Preview/FoodPreview.jsx',
  'src/Components/Preview/AccommodationPreview.jsx',
  'src/Components/Preview/PurchasePreview.jsx',
  'src/Components/Preview/MediaPreview.jsx'
];

files.forEach(processPreview);
