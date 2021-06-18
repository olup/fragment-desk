import {
  copyFile,
  createDir,
  removeDir,
  removeFile,
  renameFile,
  writeFile,
} from "@tauri-apps/api/fs";
import { invoke } from "@tauri-apps/api/tauri";
import { useStore } from "hooks/store";
import { useDirectoryConfig } from "hooks/useDirectoryConfig";
import { useDirectoryWatch } from "hooks/useDirectoryWatch";
import { keyBy } from "lodash";
import { basename, dirname, join, extname } from "path";
import { FC, useCallback, useEffect, useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import { FiArrowLeft, FiPlus } from "react-icons/fi";
import { VscAdd, VscFile, VscFiles } from "react-icons/vsc";
import { keyframes, styled } from "theme";
import { FsElement } from "types";
import { useDebouncedCallback } from "use-debounce/lib";
import { orderWith, removeExt } from "utils";
import { DraggableList } from "./DraggableList";
import { FileItem } from "./FileItem";
import { Content, Item, ItemIcon, Menu, Trigger } from "./ui/Menu";
import { ScrollArea } from "./ui/ScrollArea";

const Side = keyframes({
  "0%": { transform: "translateX(-50px)", opacity: 0 },
  "100%": { transform: "translateX(0)", opacity: 1 },
});

const SideBarStyled = styled("div", {
  display: "flex",
  flexDirection: "column",
  paddingTop: 30,
  height: "100%",
  //borderRight: "1px solid #ccc",
  backgroundColor: "#eee",
  fontFamily: "Montserrat",
  boxSizing: "border-box",
  //animation: `.1s ${Side}`,
});

const Title = styled("div", {
  padding: 10,
  borderBottom: "1px solid #eee",
  display: "flex",
  justifyContent: "center",
  position: "relative",
});

const EmptyMessage = styled("div", {
  width: "100%",
  height: "100%",
  display: "flex",
  padding: 20,
  opacity: 0.5,
  boxSizing: "border-box",
  lineHeight: 1.3,
});

export const SideBar: FC = () => {
  const filePaths = useStore((s) => s.currentFilePaths);
  const directoryPath = useStore((s) => s.currentDirectoryPath);
  const projectPath = useStore((s) => s.currentProjectPath);
  const showAddItem = useStore((s) => s.showAddItem);
  const set = useStore((s) => s.set);

  // filelist, order with the config file
  const [fileList, setFileList] = useState<FsElement[]>([]);
  const [{ customOrder }, setConfig] = useDirectoryConfig(directoryPath);

  const fileListWithPathAndId = fileList.map((f) => ({
    ...f,
    path: f.Directory?.path || f.File.path,
    id: f.Directory?.path || f.File.path,
    canCombine: !!f.Directory,
  }));

  const fileByName = keyBy(fileListWithPathAndId, "path");
  const orderedFileList = [
    ...customOrder.map((path) => fileByName[path]).filter(Boolean),
    ...fileListWithPathAndId.filter((f) => !customOrder.includes(f.path)),
  ];

  console.log(filePaths);

  /**--------------------------------------------------------------------------- */

  // if (filePaths.length) {
  //   // Find smallest common path
  //   const arrayPaths = filePaths.map((f) => f.split("/"));
  //   arrayPaths.sort((a, b) => b.length - a.length);
  //   const pivot = arrayPaths[0].map((e, i) => arrayPaths.map((el) => el[i]));
  //   const minimCommonPivot = pivot.filter((l) => l.every((i) => i === l[0]));
  //   const minPAthArray = minimCommonPivot.map((i) => i[0]);
  //   // reduce array path
  //   const reducesArrayPaths = arrayPaths.map((p) =>
  //     p.slice(minPAthArray.length)
  //   );
  //   // From common path, builds an object
  //   const red = (res: any, p: string[]) => {
  //     if (p.length === 0) return;
  //     else if (p.length === 1) res[p[0]] = true;
  //     else {
  //       res[p[0]] = {};
  //       red(res[p[0]], p.slice(1));
  //     }
  //   };
  //   const res: Record<string, any> = {};
  //   reducesArrayPaths.forEach((p) => {
  //     red(res, p);
  //   });
  //   console.log(res);
  // }

  /**--------------------------------------------------------------------------- */

  const onLoadDir = async (path?: string) => {
    if (!path) return;
    console.log("Reloading " + path);
    try {
      const fileList = await invoke<FsElement[]>("list_dir_files", {
        path,
      });
      setFileList(fileList);
    } catch (err) {
      console.log(err);
    }
  };

  const debouncedOnloadDir = useDebouncedCallback(onLoadDir, 200);

  useEffect(() => {
    if (directoryPath) onLoadDir(directoryPath);
  }, [directoryPath]);

  const onFileChange = useCallback(
    (path: string) => {
      console.log("change happened on", path);
      debouncedOnloadDir(directoryPath);
    },
    [directoryPath]
  );

  useDirectoryWatch(directoryPath, onFileChange);

  // Organizing functions
  const onSortChange = (newFileList: FsElement[]) => {
    setConfig({
      customOrder: newFileList.map((el) => el.File?.path || el.Directory.path),
    });
  };

  const onMove = async (from: string, pathTo: string) => {
    const name = basename(from);
    const to = join(pathTo, name);
    await copyFile(from, to);
    await removeFile(from);
  };

  const onAddItem = async (name: string) => {
    const type = showAddItem;

    if (type === "file") {
      const path = join(directoryPath, name) + ".md";
      await writeFile({
        contents: "",
        path,
      });
      set({ showAddItem: false, currentFilePaths: [path] });
    }

    if (type === "collection") {
      await createDir(join(directoryPath, name));
    }
  };

  const onDelete = async (
    path: string,
    type: "file" | "collection" = "file"
  ) => {
    if (type === "file") {
      await removeFile(path);
      if (filePaths.includes(path))
        set({ currentFilePaths: filePaths.filter((f) => f !== path) });
    }
    if (type === "collection") {
      await removeDir(path, { recursive: true });
    }
  };

  const onRename = async (name: string, path: string) => {
    const newPath = join(dirname(path), name) + extname(path);
    await renameFile(path, join(dirname(path), name) + extname(path));
    // update present selected document
    if (filePaths.includes(path))
      set({
        currentFilePaths: filePaths.map((f) => (f === path ? newPath : f)),
      });
    // update sorting list
    if (customOrder.includes(path)) {
      setConfig({
        customOrder: customOrder.map((thisPath) =>
          thisPath === path ? newPath : thisPath
        ),
      });
    }
  };

  const onSelect = (path: string, type: "file" | "collection") => {
    if (type === "file") set({ currentFilePaths: [path] });
    if (type === "collection") set({ currentDirectoryPath: path });
  };
  const onMultiSelect = async (path: string, type: "file" | "collection") => {
    if (!filePaths.includes(path))
      set({
        currentFilePaths: orderWith([...filePaths, path], customOrder),
      });
    else
      set({
        currentFilePaths: filePaths.filter((p) => p !== path),
      });
    // } else {
    //   if (!!filePaths.find((filePath) => filePath.startsWith(path))) {
    //     set({
    //       currentFilePaths: filePaths.filter((p) => !p.startsWith(path)),
    //     });
    //   } else {
    //     const allPath = await invoke<string[]>("list_path_deep", { path });
    //     set({
    //       currentFilePaths: orderWith(
    //         [...new Set([...filePaths, ...allPath])],
    //         customOrder
    //       ),
    //     });
    //   }
    // }
  };

  const [_, drop] = useDrop({
    accept: "file",
    drop: async (item: any) => {
      const path = item.id;
      await onMove(path, dirname(directoryPath));
    },
  });

  if (!directoryPath)
    return (
      <SideBarStyled>
        <EmptyMessage>
          You can open a directory to edit and manage your writing
        </EmptyMessage>
      </SideBarStyled>
    );

  return (
    <SideBarStyled>
      <Title ref={drop}>
        {directoryPath !== projectPath && (
          <div
            style={{
              position: "absolute",
              left: 10,
              cursor: "pointer",
            }}
            onClick={() => {
              set({ currentDirectoryPath: dirname(directoryPath) });
            }}
          >
            <FiArrowLeft />
          </div>
        )}
        <div>{basename(directoryPath)}</div>
        <div
          style={{
            position: "absolute",
            right: 10,
            cursor: "pointer",
          }}
          onClick={() => {
            set({ currentDirectoryPath: dirname(directoryPath) });
          }}
        >
          <Menu>
            <Trigger>
              <VscAdd />
            </Trigger>
            <Content>
              <Item onSelect={() => set({ showAddItem: "file" })}>
                <ItemIcon as={VscFile} />
                Add sheet
              </Item>
              <Item onSelect={() => set({ showAddItem: "collection" })}>
                <ItemIcon as={VscFiles} />
                Add collection
              </Item>
            </Content>
          </Menu>
        </div>
      </Title>

      <div style={{ flex: 1, minHeight: 0 }}>
        <ScrollArea>
          <DraggableList
            forType="file"
            elements={orderedFileList}
            onSortChange={onSortChange}
            onCombine={onMove}
            render={({ File, Directory }, handle) => {
              const type = !!File ? "file" : "collection";
              const path = File?.path || Directory.path;

              return (
                <FileItem
                  dragHandle={handle}
                  path={path}
                  type={type}
                  name={Directory?.name || removeExt(File?.name || "")}
                  description={
                    !!File
                      ? File?.preview?.slice(0, 100)
                      : `${Directory?.children_count} items`
                  }
                  selected={
                    !!filePaths.find((filePath) => path.startsWith(filePath))
                  }
                  onSelect={() => onSelect(path, type)}
                  onMutliSelect={() => onMultiSelect(path, type)}
                  onDelete={() => onDelete(path, type)}
                  onChangeName={onRename}
                />
              );
            }}
          ></DraggableList>
          {showAddItem && (
            <FileItem
              path=""
              name=""
              type={showAddItem}
              isEditMode
              onChangeName={onAddItem}
              onCancel={() => set({ showAddItem: false })}
            />
          )}
        </ScrollArea>
      </div>
    </SideBarStyled>
  );
};
