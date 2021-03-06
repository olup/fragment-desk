import { readTextFile, writeFile } from "@tauri-apps/api/fs";
import { stringify } from "querystring";
import { useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce/lib";

type Config = {
  customOrder: string[];
};

const defaultConfig: Config = {
  customOrder: [],
};

export const useDirectoryConfig = (path: string) => {
  const [config, setConfigRaw] = useState<Config>(defaultConfig);
  const writeDebounce = useDebouncedCallback(
    (path: string, contents: string) =>
      writeFile({
        path,
        contents,
      }),
    1000
  );

  const setConfig = (configPatch: Partial<Config>) => {
    const newConfig = { ...config, ...configPatch };
    writeDebounce(path + "/.fragment", JSON.stringify(newConfig));
    setConfigRaw(newConfig);
  };

  useEffect(() => {
    if (!path) return;
    readTextFile(path + "/.fragment")
      .then((textConfig) => setConfigRaw(JSON.parse(textConfig)))
      .catch((err) =>
        console.log("Could not read the directory config for " + path)
      );
  }, [path]);

  return [config, setConfig] as const;
};
