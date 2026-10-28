import { compile } from "tailwindcss";
import { activeClassNames } from "./class-source";

export async function compileComponentStyle(mode: "css" | "tailwind", source: string, theme = "") {
  const input =
    mode === "css"
      ? source
      : `${theme}\n@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *));\n@tailwind utilities;`;
  const compiler = await compile(input);
  return compiler.build(mode === "tailwind" ? activeClassNames(source) : []);
}
