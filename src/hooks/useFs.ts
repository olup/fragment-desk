import { open } from "@tauri-apps/api/dialog";
import { writeFile } from "@tauri-apps/api/fs";
import { invoke } from "@tauri-apps/api/tauri";
import { format } from "date-fns";
import { nanoid } from "nanoid";
import { useStore } from "./store";

export const useFs = (directoryPath: string) => {
  const set = useStore((s) => s.set);
  const openDir = async () => {
    const path = (await open({
      multiple: false,
      directory: true,
    })) as string;
    set({ currentProjectPath: path });
  };

  const createFile = async () => {
    const path = `${directoryPath}/${format(new Date(), "yyyy-MM-dd")}-${nanoid(
      3
    )}.md`;
    await writeFile({ path, contents: "" });
  };

  const openFile = async () => {
    const newPath = (await open({
      multiple: false,
      //defaultPath: filePath || undefined,
    })) as string;
  };

  return { openDir, createFile, openFile };
};
