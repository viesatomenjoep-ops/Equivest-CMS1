const GITHUB_TOKEN = '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';
const GITHUB_OWNER = 'viesatomenjoep-ops';
const GITHUB_REPO = 'equivest-platform';
const btoa = (str) => Buffer.from(str, 'utf-8').toString('base64');

async function rescueVercel() {
  const url = 'https://api.github.com/repos/viesatomenjoep-ops/equivest-platform/contents/src/content/portfolio/en/unique.md';
  const getRes = await fetch(url + '?ref=main', { headers: { Authorization: 'Bearer ' + GITHUB_TOKEN } });
  const data = await getRes.json();
  const sha = data.sha;

  const fixedContent = `---
title: Unique
description: Large pony - Gelding
image: "../../../assets/images/unique.jpg"
premium: false
youtube_url: ''
featured: false
category: Ponys
specs:
  age: 4
  gender: Gelding
  height: Large pony
  purchase_price: € 30.000
  target_sale: TBD
  level: TBD
documents:
  fei_data: ''
horsetelex_url: ''
---

Unique is a stunning 4-year-old large pony gelding, available for an investment of € 30.000.`;

  const res = await fetch(url, {
    method: 'PUT',
    headers: { Authorization: 'Bearer ' + GITHUB_TOKEN, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'Rescue Vercel crash (restore unique.md)',
      content: btoa(fixedContent),
      sha: sha,
      branch: 'main'
    })
  });
  if (res.ok) console.log('Fixed unique.md and Vercel will now heal.');
  else console.log(await res.text());
}
rescueVercel();
