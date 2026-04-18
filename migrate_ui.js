const fs = require('fs');

const GITHUB_TOKEN = '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';
const GITHUB_OWNER = 'viesatomenjoep-ops';
const GITHUB_REPO = 'equivest-platform';

const btoa = (str) => Buffer.from(str, 'utf-8').toString('base64');

async function migrate() {
  const urlParams = `?ref=main`;
  const uiUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/src/i18n/ui.ts`;

  console.log('Fetching ui.ts from Github...');
  const getRes = await fetch(uiUrl + urlParams, {
    headers: { Authorization: `Bearer ${GITHUB_TOKEN}` }
  });
  
  if (!getRes.ok) {
     console.error('Failed to get ui.ts', await getRes.text());
     return;
  }
  
  const data = await getRes.json();
  const fileSha = data.sha;
  const content = Buffer.from(data.content, 'base64').toString('utf-8');

  // Regex to extract the UI object
  const uiRegex = /export const ui = (\{[\s\S]*?\})\s*as const;/;
  const match = content.match(uiRegex);
  
  if (!match) {
    console.error("Could not find ui object to extract!");
    return;
  }

  const rawUiObjectStr = match[1];
  
  // To safely convert JS object string to JSON, we can use eval since it's a sterile ts file environment
  let uiObject;
  try {
     eval('uiObject = ' + rawUiObjectStr);
  } catch(e) {
     console.error("Failed to eval ui object", e);
     return;
  }

  const uiJsonStr = JSON.stringify(uiObject, null, 2);

  // Re-generate ui.ts top content
  const originalTop = content.replace(uiRegex, '').trim();
  const newUiTsContent = `import uiData from './ui.json';

${originalTop}

export const ui = uiData as any;
`;

  console.log('Writing ui.json to Github...');
  const jsonRes = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/src/i18n/ui.json`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${GITHUB_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'CMS: Migrate i18n dictionaries to JSON for universal editing',
      content: btoa(uiJsonStr),
      branch: 'main'
    })
  });
  
  if (!jsonRes.ok) {
     console.error("Failed to write json", await jsonRes.text());
     return;
  }
  
  console.log('Replacing ui.ts on Github...');
  const tsRes = await fetch(uiUrl, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${GITHUB_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'CMS: Refactor ui.ts to import from ui.json',
      content: btoa(newUiTsContent),
      sha: fileSha,
      branch: 'main'
    })
  });

  if (!tsRes.ok) {
     console.error("Failed to patch ui.ts", await tsRes.text());
     return;
  }

  console.log('Migration successfully completed!');
}

migrate();
