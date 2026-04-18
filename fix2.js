const GITHUB_TOKEN = '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';
const GITHUB_OWNER = 'viesatomenjoep-ops';
const GITHUB_REPO = 'equivest-platform';

const btoa = (str) => Buffer.from(str, 'utf-8').toString('base64');

async function fix() {
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

  const res = await fetch('https://api.github.com/repos/viesatomenjoep-ops/equivest-platform/contents/src/content/portfolio/en/unique.md', {
    method: 'PUT',
    headers: { Authorization: 'Bearer ' + GITHUB_TOKEN, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'Rescue main Vercel branch for unique.jpg',
      content: btoa(fixedContent),
      sha: '05b7a35de30933194e34b0deb6aa32232efedbb8',
      branch: 'main'
    })
  });
  if (res.ok) console.log('Restored origin unique.md!');
  else console.log(await res.text());
}
fix();
