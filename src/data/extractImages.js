function extractImages (uniforms) {
  const images = [];
  for (let u in uniforms) {
    let value = uniforms[u];
    if (value &&
      typeof value === "object" &&
      value.type === "uri" &&
      value.uri &&
      typeof value.uri === "string") {
      images.push(value);
    }
  }
  return images;
}

module.exports = extractImages;
