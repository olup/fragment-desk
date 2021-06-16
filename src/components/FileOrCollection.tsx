import { Separator } from "components/Separator";
import { invoke } from "@tauri-apps/api/tauri";
import { FC, useEffect, useState } from "react";
import { FileEditor } from "./FileEditor";
import { removeExt } from "utils";
import { useStore } from "hooks/store";

export const FileOrCollection: FC<{ path: string }> = ({ path }) => {
  const [type, setType] = useState<"file" | "collection" | undefined>();
  const [pathList, setPathList] = useState<string[]>([]);

  const set = useStore((s) => s.set);
  useEffect(() => {
    invoke<boolean>("is_dir", { path }).then((isDir) => {
      if (isDir) {
        invoke<string[]>("list_path_deep", { path, deep: false }).then((l) => {
          console.log(l);
          setPathList(l);
        });
      }
      setType(isDir ? "collection" : "file");
    });
  }, [path]);
  if (!type) return null;
  if (type === "file") return <FileEditor path={path} key={path} />;
  if (type === "collection")
    return (
      <>
        {pathList?.map((path) => (
          <>
            <Separator
              title={removeExt(path)}
              onClick={() => set({ currentFilePaths: [path] })}
            />
            <FileOrCollection path={path} key={path} />
          </>
        )) || null}
      </>
    );
  return null;
};
