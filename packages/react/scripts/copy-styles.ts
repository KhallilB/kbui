// Ship the full stylesheet so a React app installs one package; build @kb.ui/css first.
const from = Bun.file(new URL("../../css/dist/styles.css", import.meta.url));
if (!(await from.exists())) throw new Error("Build @kb.ui/css before @kb.ui/react");
await Bun.write(new URL("../dist/styles.css", import.meta.url), from);
console.log("react: copied styles.css into dist");
