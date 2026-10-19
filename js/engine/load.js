export async function loadJson(filename) {
  const response = await fetch(new URL(`../../assets/json/${filename}`, import.meta.url));
  if (!response.ok) throw new Error(`Cannot load ${filename}: ${response.status}`);
  return response.json();
}

export async function loadFont() {
  const url = new URL('../../assets/fonts/Alice-Regular.ttf', import.meta.url);
  const font = new FontFace('Alice', `url("${url.href}")`);
  document.fonts.add(await font.load());
}
