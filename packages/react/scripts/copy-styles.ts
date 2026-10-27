// Ship the full stylesheet so a React app installs one package; build @kbui/css first.
const from = Bun.file(new URL("../../css/dist/styles.css", import.meta.url));
if (!(await from.exists())) throw new Error("Build @kbui/css before @kbui/react");
await Bun.write(new URL("../dist/styles.css", import.meta.url), from);
console.log("react: copied styles.css into dist");
