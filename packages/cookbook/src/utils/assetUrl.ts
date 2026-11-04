// Files in public/assets are served under Vite's base, which is /gl-react/ on
// GitHub Pages: an absolute "/assets/..." path would 404 there.
export const assetUrl = (name: string): string =>
  `${import.meta.env.BASE_URL}assets/${name}`;
