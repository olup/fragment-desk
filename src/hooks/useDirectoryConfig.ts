import { readTextFile, writeFile } from "@tauri-apps/api/fs";
import { useEffect, useState } from "react";

type Config = {
  customOrder: string[];
};

const defaultConfig: Config = {
  customOrder: [],
};

export const useDirectoryConfig = (path: string) => {
  console.log(path);
  const [config, setConfigRaw] = useState<Config>(defaultConfig);

  const setConfig = (configPatch: Partial<Config>) => {
    const newConfig = { ...config, ...configPatch };
    writeFile({
      path: path + "/.fragment",
      contents: JSON.stringify(newConfig),
    });
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
