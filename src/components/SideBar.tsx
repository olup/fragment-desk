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
import { FiArrowLeft, FiPlus } from "react-icons/fi";
import { VscFile, VscFiles } from "react-icons/vsc";
import { styled } from "theme";
import { FsElement } from "types";
import { removeExt } from "utils";
import { DraggableList } from "./DraggableList";
import { FileItem } from "./FileItem";
import { Content, Item, ItemIcon, Menu, Trigger } from "./ui/Menu";
import { ScrollArea } from "./ui/ScrollArea";

const SideBarStyled = styled("div", {
  display: "flex",
  flexDirection: "column",
  height: "100%",
  borderRight: "1px solid #ccc",
  fontFamily: "Monserrat",
});

const Title = styled("div", {
  padding: 10,
  borderBottom: "1px solid #eee",
  display: "flex",
  justifyContent: "center",
  position: "relative",
});

const FileStyled = styled("div", {
  display: "Flex",
  width: "100%",
  userSelect: "none",
  borderBottom: "1px solid #eee",
  borderTop: "1px solid #eee",
  padding: 10,
  boxSizing: "border-box",
  cursor: "pointer",
  marginTop: -1,
  position: "relative",
  zIndex: 0,
  opacity: 0.5,
  backgroundColor: "#fff",
  "&:hover": {
    opacity: 1,

    zIndex: 10,
  },
  variants: {
    selected: {
      true: {
        opacity: 1,

        boxShadow: "3px 0 0 #2d7be0 inset",
        zIndex: 10,
      },
    },
  },
});

const EmptyMessage = styled("div", {
  width: "100%",
  height: "100%",
  display: "flex",
  padding: 20,
  opacity: 0.5,
  boxSizing: "border-box",
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

  const onLoadDir = async (path?: string) => {
    if (!path) return;
    try {
      const fileList = await invoke<FsElement[]>("list_dir_files", {
        path,
      });
      setFileList(fileList);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (directoryPath) onLoadDir(directoryPath);
  }, [directoryPath]);

  const onFileChange = useCallback(
    (path: string) => {
      console.log("change happened on", path);
      onLoadDir(directoryPath);
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
      <Title>
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
              <FiPlus />
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
            render={({ File, Directory }, handle) => (
              <FileItem
                dragHandle={handle}
                path={File?.path || Directory.path}
                name={Directory?.name || removeExt(File?.name || "")}
                description={
                  !!File
                    ? File?.preview?.slice(0, 100)
                    : `${Directory?.children_count} items`
                }
                type={!!File ? "file" : "collection"}
                selected={filePaths.includes(File?.path)}
                onSelect={() => {
                  if (File) set({ currentFilePaths: [File.path] });
                  if (Directory) set({ currentDirectoryPath: Directory.path });
                }}
                onMutliSelect={() => {
                  if (File) {
                    if (!filePaths.includes(File.path))
                      set({ currentFilePaths: [...filePaths, File.path] });
                    else
                      set({
                        currentFilePaths: filePaths.filter(
                          (p) => p !== File.path
                        ),
                      });
                  }
                }}
                onDelete={() =>
                  onDelete(
                    File?.path || Directory.path,
                    !!File ? "file" : "collection"
                  )
                }
                onChangeName={onRename}
              />
            )}
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
