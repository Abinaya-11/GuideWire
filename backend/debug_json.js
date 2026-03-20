const fs = require('fs');
try {
  const content = fs.readFileSync('serviceAccountKey.json', 'utf8');
  console.log('File read successfully');
  const json = JSON.parse(content);
  console.log('JSON parsed successfully');
} catch (err) {
  console.error('Error:', err.message);
  if (err.at) console.log('At:', err.at);
}
