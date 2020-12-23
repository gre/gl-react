import markdown from "../../markdown";
export const title = "GameOfLife (20fps, grow & reset each 5s)";
export const desc = markdown`
**Game of Life**, GL as a state machine
`;
export const descAfter = markdown`
First frame is rendered with a "random" shader.
Next frames use Game of Life cellular automaton.

gl-react have a \`Backbuffer\` Symbol we can pass
as texture uniform to access previously drawn frame.

> gl-react hooks React lifecycle to GL draws.
> \`componentDidUpdate => gl.draw\`
`;
