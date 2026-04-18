const GITHUB_TOKEN = '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';
const GITHUB_OWNER = 'viesatomenjoep-ops';
const GITHUB_REPO = 'equivest-platform';

// Create a 1x1 transparent PNG pixel base64 as test
const tinyPngBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

async function testUpload() {
  const url = 'https://api.github.com/repos/viesatomenjoep-ops/equivest-platform/contents/src/assets/images/test1234.png';
  console.log("Uploading test image...");
  const res = await fetch(url, {
    method: 'PUT',
    headers: { Authorization: 'Bearer ' + GITHUB_TOKEN, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'Test Image Upload',
      content: tinyPngBase64,
      branch: 'main'
    })
  });
  if (res.ok) console.log('Successfully uploaded test PNG!');
  else console.log(await res.text());
}

testUpload();
