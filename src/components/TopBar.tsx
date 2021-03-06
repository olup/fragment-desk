import { appWindow } from "@tauri-apps/api/window";
import { useStore } from "hooks/store";
import { useFs } from "hooks/useFs";
import { basename } from "path";
import { FC } from "react";
import { AiOutlineMenu } from "react-icons/ai";
import { FiSidebar } from "react-icons/fi";
import {
  VscChromeClose,
  VscChromeMaximize,
  VscChromeMinimize,
  VscFile,
  VscFolderOpened,
  VscInfo,
} from "react-icons/vsc";
import { WiMoonFull } from "react-icons/wi";
import { RiFilePaper2Line } from "react-icons/ri";
import { styled } from "theme";
import { removeExt } from "utils";
import { Content, Item, ItemIcon, Menu, Trigger } from "./ui/Menu";
import { Tooltip } from "./ui/Tooltip";

const TopBarContainer = styled("div", {
  fontFamily: "Montserrat",
  fontSize: 12,
  // position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  height: 30,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  userSelect: "none",
  //backgroundColor: "#fff",
  zIndex: 100,
  paddingLeft: 10,
  paddingRight: 10,
  //borderBottom: "1px solid #ccc",
  boxSizing: "border-box",
});

const TopIconLeft = styled("div", {
  marginRight: 10,
  cursor: "pointer",
  opacity: 0.5,
  "&:hover": {
    opacity: 1,
  },
});
const TopIconRight = styled(TopIconLeft, {
  marginLeft: 10,
  marginRight: 0,
});

export const TopBar: FC = () => {
  const showSide = useStore((s) => s.showSide);
  const filePaths = useStore((s) => s.currentFilePaths);
  const showInfo = useStore((s) => s.showInfo);
  const scrollMode = useStore((s) => s.scrollMode);
  const topbarStyle = useStore((s) => s.topbarStyle);
  const set = useStore((s) => s.set);
  const { openFile, openDir } = useFs();

  // calcuate title
  let title = "Fragment";
  if (filePaths?.length) {
    title = removeExt(basename(filePaths[0]));
    if (filePaths?.length > 1)
      title = `${title} + ${filePaths.length - 1} sheets`;
  }

  return (
    <TopBarContainer className="titlebar" data-tauri-drag-region="">
      <div style={{ flex: 1, display: "flex" }} data-tauri-drag-region="">
        {topbarStyle === "macos" && (
          <>
            <TopIconLeft as={WiMoonFull} />
            <TopIconLeft as={WiMoonFull} />
            <TopIconLeft as={WiMoonFull} />
          </>
        )}

        <Menu>
          <Trigger>
            <Tooltip label="Open Menu">
              <TopIconLeft as={AiOutlineMenu} />{" "}
            </Tooltip>
          </Trigger>
          <Content sideOffset={10}>
            <Item onSelect={openFile}>
              <ItemIcon as={VscFile} />
              Open File
            </Item>
            <Item onSelect={openDir}>
              <ItemIcon as={VscFolderOpened} />
              Open Directory
            </Item>
          </Content>
        </Menu>

        <Tooltip label="Open Side Bar">
          <TopIconLeft
            as={FiSidebar}
            onClick={() => set({ showSide: !showSide })}
            style={{ opacity: showSide ? 1 : 0.3 }}
          />
        </Tooltip>
      </div>
      <div>{title || "Fragment"}</div>
      <div
        style={{ flex: 1, justifyContent: "flex-end", display: "flex" }}
        data-tauri-drag-region=""
      >
        <Tooltip label="Typewriter mode">
          <TopIconRight
            as={RiFilePaper2Line}
            style={{ opacity: scrollMode ? 1 : 0.3 }}
            onClick={() => set({ scrollMode: !scrollMode })}
          />
        </Tooltip>
        <TopIconRight
          as={VscInfo}
          onClick={() => set({ showInfo: !showInfo })}
        />
        {topbarStyle === "standard" && (
          <>
            <TopIconRight
              as={VscChromeMinimize}
              onClick={() => appWindow.minimize()}
            />
            <TopIconRight
              as={VscChromeMaximize}
              onClick={() => appWindow.maximize()}
            />
            <TopIconRight
              as={VscChromeClose}
              onClick={() => appWindow.close()}
            />
          </>
        )}
      </div>
    </TopBarContainer>
  );
};
