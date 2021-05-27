import { appWindow } from "@tauri-apps/api/window";
import { useStore } from "hooks/store";
import { basename } from "path";
import { FC } from "react";
import { FiMenu, FiSidebar } from "react-icons/fi";
import { AiOutlineMenu } from "react-icons/ai";
import {
  VscChromeClose,
  VscChromeMaximize,
  VscChromeMinimize,
  VscInfo,
} from "react-icons/vsc";
import { styled } from "theme";
import { removeExt } from "utils";
import { InfoBox } from "./InfoBox";
import { Spacer } from "./ui/Spacer";

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
  backgroundColor: "#fff",
  zIndex: 100,
  paddingLeft: 10,
  paddingRight: 10,
  borderBottom: "1px solid #ccc",
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
  marginLeft: 0,
  marginRight: 10,
});

export const TopBar: FC = () => {
  const [showSide, filePath] = useStore((s) => [s.showSide, s.currentFilePath]);
  const showInfo = useStore((s) => s.showInfo);
  const set = useStore((s) => s.set);
  return (
    <TopBarContainer className="titlebar" data-tauri-drag-region="">
      <div style={{ flex: 1 }} data-tauri-drag-region="">
        <TopIconLeft as={AiOutlineMenu} />
        <TopIconLeft
          as={FiSidebar}
          onClick={() => set({ showSide: !showSide })}
          style={{ opacity: showSide ? 1 : 0.3, cursor: "pointer" }}
        />
      </div>
      <div>{filePath ? removeExt(basename(filePath)) : "Fragment"}</div>
      <div
        style={{ flex: 1, justifyContent: "flex-end", display: "flex" }}
        data-tauri-drag-region=""
      >
        <TopIconRight
          as={VscInfo}
          onClick={() => set({ showInfo: !showInfo })}
        />
        <TopIconRight
          as={VscChromeMinimize}
          onClick={() => appWindow.minimize()}
        />
        <TopIconRight
          as={VscChromeMaximize}
          onClick={() => appWindow.maximize()}
        />
        <TopIconRight as={VscChromeClose} onClick={() => appWindow.close()} />
      </div>
      {showInfo && <InfoBox />}
    </TopBarContainer>
  );
};
