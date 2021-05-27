import { copyFile, removeFile } from "@tauri-apps/api/fs";
import { invoke } from "@tauri-apps/api/tauri";
import { useStore } from "hooks/store";
import { useDirectoryConfig } from "hooks/useDirectoryConfig";
import { useDirectoryWatch } from "hooks/useDirectoryWatch";
import { keyBy } from "lodash";
import { basename, dirname, join } from "path";
import { FC, useCallback, useEffect, useState } from "react";
import { FiArrowLeft } from "react-icons/fi";
import { VscFile, VscFiles } from "react-icons/vsc";
import { styled } from "theme";
import { FsElement } from "types";
import { removeExt } from "utils";
import { DraggableList } from "./DraggableList";
import { Icon } from "./ui/Icon";
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

const FileContentStyled = styled("div", {
  fontSize: 12,
  opacity: 0.5,
});

export const SideBar: FC = () => {
  const filePath = useStore((s) => s.currentFilePath);
  const directoryPath = useStore((s) => s.currentDirectoryPath);
  const projectPath = useStore((s) => s.currentProjectPath);
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
    (path: string) => onLoadDir(directoryPath),
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
      </Title>

      <div style={{ flex: 1, minHeight: 0 }}>
        <ScrollArea>
          <DraggableList
            forType="file"
            elements={orderedFileList}
            onSortChange={onSortChange}
            onCombine={onMove}
            render={(element) => (
              <FileStyled
                onClick={() => {
                  if (element.File) set({ currentFilePath: element.File.path });
                  if (element.Directory)
                    set({ currentDirectoryPath: element.Directory.path });
                }}
                selected={element.File?.path == filePath}
              >
                <div style={{ marginRight: 10 }}>
                  <Icon as={element.File ? VscFile : VscFiles} />
                </div>
                <div>
                  <div style={{ marginBottom: 5 }}>
                    {element.Directory?.name ||
                      removeExt(element.File?.name || "")}
                  </div>
                  {element.File && (
                    <FileContentStyled>
                      {element.File?.preview?.slice(0, 100)}
                    </FileContentStyled>
                  )}
                  {element.Directory && (
                    <FileContentStyled>
                      {element.Directory?.children_count} items
                    </FileContentStyled>
                  )}
                </div>
              </FileStyled>
            )}
          ></DraggableList>
        </ScrollArea>
      </div>
    </SideBarStyled>
  );
};
