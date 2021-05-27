import { open } from "@tauri-apps/api/dialog";
import { writeFile } from "@tauri-apps/api/fs";
import { format } from "date-fns";
import { nanoid } from "nanoid";
import { useStore } from "./store";

export const useFs = () => {
  const set = useStore((s) => s.set);
  const currentDirectoryPath = useStore((s) => s.currentDirectoryPath);

  const openDir = async () => {
    const path = (await open({
      multiple: false,
      directory: true,
    })) as string;
    set({ currentProjectPath: path, currentDirectoryPath: path });
  };

  const createFile = async () => {
    const path = `${currentDirectoryPath}/${format(
      new Date(),
      "yyyy-MM-dd"
    )}-${nanoid(3)}.md`;
    await writeFile({ path, contents: "" });
  };

  const openFile = async () => {
    const path = (await open({
      multiple: false,
      defaultPath: currentDirectoryPath,
    })) as string;
    set({ currentFilePath: path });
  };

  return { openDir, createFile, openFile };
};
