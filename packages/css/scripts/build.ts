import { buildCss } from "../src/build";

const src = new URL("../src/", import.meta.url).pathname;
const dist = new URL("../dist/", import.meta.url).pathname;
await buildCss(src, dist);
console.log("css: built dist/styles.css");
