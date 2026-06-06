const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '../../backend/.env');
let GEMINI_API_KEY = '';
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const matchKey = envContent.match(/^GEMINI_API_KEY\s*=\s*(.+)$/m);
  if (matchKey) {
    GEMINI_API_KEY = matchKey[1].trim();
  }
}

async function testModel(model) {
  console.log(`Testing model: ${model}`);
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: "Hello" }] }]
      })
    });
    console.log(`Status: ${response.status}`);
    const text = await response.text();
    console.log(`Response: ${text.substring(0, 300)}`);
  } catch (e) {
    console.error(`Error: ${e.message}`);
  }
}

async function run() {
  await testModel('gemini-2.0-flash');
  await testModel('gemini-1.5-flash');
  await testModel('gemini-1.5-pro');
}

run();
