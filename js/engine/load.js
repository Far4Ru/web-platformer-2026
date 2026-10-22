export async function loadJson(filename) {
  const response = await fetch(`assets/json/${filename}`);
  if (!response.ok) throw new Error(`Cannot load ${filename}: ${response.status}`);
  return response.json();
}

export async function loadFont() {
  const url = new URL('assets/fonts/Alice-Regular.ttf', document.baseURI);
  const font = new FontFace('Alice', `url("${url.href}")`);
  document.fonts.add(await font.load());
}
