import markdown from "../../markdown";
export const title = "Render text and apply effects";
export const desc = `The only way to draw text is a Canvas2D text
that we send as a texture.`;
export const descAfter = markdown`
We are using the library \`react-json2d\` to render our Canvas2D text.
We can just pass \`<JSON2D>\` element in \`<Node\`> uniforms.
gl-react will render it like a normal React Element.
`;
