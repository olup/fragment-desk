import { extname } from "path";

export const removeExt = (name: string) => name.replace(extname(name), "");
