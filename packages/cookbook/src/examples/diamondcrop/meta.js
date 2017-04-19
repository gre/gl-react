import markdown from "../../markdown";
export const title = "DiamondCrop on an image texture";
export const desc = markdown`
This is our first texture example.
We send our DiamondCrop shader an image.
`;

export const descAfter = markdown`
An \`uniform sampler2D\` is used
to send a shader a texture.
gl-react supports many texture formats....
In this example, we just pass a string:
the image URL.
`;
