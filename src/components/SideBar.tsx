import { open } from "@tauri-apps/api/dialog";
import { writeFile } from "@tauri-apps/api/fs";
import { invoke } from "@tauri-apps/api/tauri";
import { format } from "date-fns";
import { useAppStore } from "hooks/appStore";
import { useStore } from "hooks/store";
import { nanoid } from "nanoid";
import { dirname, relative } from "path";
import { FC, useEffect, useState } from "react";
import { FiArrowLeft, FiFile, FiFilePlus, FiFolder } from "react-icons/fi";
import { styled } from "theme";
import { FsElement } from "types";
import { removeExt } from "utils";
import { Icon } from "./ui/Icon";
import { Flex } from "./ui/Layout";
import { ScrollArea } from "./ui/ScrollArea";

const SideBarStyled = styled("div", {
  display: "flex",
  flexDirection: "column",
  height: "100%",
  borderRight: "1px solid #ccc",
  fontFamily: "Monserrat",
});

const FileStyled = styled("div", {
  display: "Flex",
  width: "100%",
  userSelect: "none",
  borderBottom: "1px solid #ccc",
  borderTop: "1px solid #ccc",
  padding: 10,
  boxSizing: "border-box",
  cursor: "pointer",
  marginTop: -1,
  position: "relative",
  zIndex: 0,
  "&:hover": {
    backgroundColor: "#2d7be0",
    color: "#fff",
    borderBottom: "1px solid #2d7be0",
    borderTop: "1px solid #2d7be0",
    zIndex: 10,
  },
  variants: {
    selected: {
      true: {
        backgroundColor: "#2d7be0",
        color: "#fff",
        borderBottom: "1px solid #2d7be0",
        borderTop: "1px solid #2d7be0",
        zIndex: 10,
      },
    },
  },
});

const FileContentStyled = styled("div", {
  fontSize: 12,
  opacity: 0.5,
});

const MainButton = styled("div", {
  flex: 1,
  display: "flex",
  height: 50,
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  fontSize: 16,
  opacity: 0.5,
  "&:hover": {
    opacity: 1,
  },
});

export const SideBar: FC<{ onOpen?: (path: string) => void }> = ({
  onOpen,
}) => {
  const filePath = useStore((s) => s.currentFilePath);
  const directoryPath = useStore((s) => s.currentDirectoryPath);
  const projectPath = useStore((s) => s.currentProjectPath);
  const set = useStore((s) => s.set);

  const [fileList, setFileList] = useState<FsElement[]>([]);

  const onOpenFile = async () => {
    const newPath = (await open({
      multiple: false,
      //defaultPath: filePath || undefined,
    })) as string;
    onOpen?.(newPath);
  };

  const onLoadDir = async (path?: string) => {
    if (!path) return;
    try {
      console.log("loading...");
      const fileList = await invoke<FsElement[]>("list_dir_files", {
        path,
      });
      console.log("loaded");
      setFileList(fileList);
      set({ currentDirectoryPath: path });
    } catch (err) {
      console.log(err);
    }
  };

  const onOpenDir = async () => {
    const path = (await open({
      multiple: false,
      directory: true,
    })) as string;
    set({ currentProjectPath: path });
    onLoadDir(path);
  };

  const onCreateFile = async () => {
    const path = `${directoryPath}/${format(new Date(), "yyyy-MM-dd")}-${nanoid(
      3
    )}.md`;
    await writeFile({ path, contents: "" });
    await onLoadDir(directoryPath);
    onOpen?.(path);
  };

  useEffect(() => {
    if (directoryPath) onLoadDir(directoryPath);
  }, []);

  return (
    <SideBarStyled>
      <div style={{ borderBottom: "1px solid #ccc", display: "flex" }}>
        <MainButton onClick={onOpenFile}>
          <Icon as={FiFile} />
        </MainButton>
        <MainButton onClick={onOpenDir}>
          <Icon as={FiFolder} />
        </MainButton>
        <MainButton>
          <Icon as={FiFilePlus} onClick={onCreateFile} />
        </MainButton>
      </div>

      {directoryPath !== projectPath && (
        <FileStyled
          onClick={() => {
            onLoadDir(dirname(directoryPath));
          }}
        >
          <div>
            <FiArrowLeft />
          </div>
        </FileStyled>
      )}
      <div style={{ flex: 1 }}>
        <ScrollArea>
          {fileList?.map((element) => (
            <FileStyled
              onClick={() => {
                if (element.File) onOpen?.(element.File.path);
                if (element.Directory) onLoadDir(element.Directory.path);
              }}
              selected={element.File?.path == filePath}
            >
              <div style={{ marginRight: 10 }}>
                <Icon as={element.File ? FiFile : FiFolder} />
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
          ))}
        </ScrollArea>
      </div>
    </SideBarStyled>
  );
};
