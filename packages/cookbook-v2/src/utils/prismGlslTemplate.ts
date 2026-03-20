import Prism from "prismjs";
import "prismjs/components/prism-c";
import "prismjs/components/prism-glsl";

// Highlight GLSL inside tagged template literals (GLSL`...`)
Prism.hooks.add("after-tokenize", (env) => {
  if (env.language !== "tsx" && env.language !== "jsx") return;
  walkTokens(env.tokens);
});

function walkTokens(tokens: (string | Prism.Token)[]) {
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (typeof token === "string") continue;
    if (token.type === "template-string") {
      tryHighlightGlsl(token);
    }
    if (Array.isArray(token.content)) {
      walkTokens(token.content);
    }
  }
}

function tryHighlightGlsl(token: Prism.Token) {
  const content = token.content;
  if (!Array.isArray(content)) return;

  // Find the string part inside the template-string
  for (let i = 0; i < content.length; i++) {
    const part = content[i];
    if (typeof part !== "string" && part.type === "string" && typeof part.content === "string") {
      // Heuristic: check if it looks like GLSL
      if (!/void\s+main\s*\(|gl_FragColor|precision\s+\w+p\s+float|out\s+vec4/.test(part.content)) continue;
      // Re-tokenize as GLSL and mark the token
      part.content = Prism.tokenize(part.content, Prism.languages.glsl);
      part.type = "glsl-block";
    }
  }
}
