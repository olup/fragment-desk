import { useStore } from "hooks/store";
import { basename } from "path";
import { FC } from "react";
import { FiMenu } from "react-icons/fi";
import { styled } from "theme";
import { removeExt } from "utils";
import { Icon } from "./ui/Icon";
import { Spacer } from "./ui/Spacer";

const TopBarContainer = styled("div", {
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
  paddingLeft: 5,
  paddingRigth: 5,
  borderBottom: "1px solid #ccc",
});

export const TopBar: FC = () => {
  const [showSide, filePath] = useStore((s) => [s.showSide, s.currentFilePath]);
  const set = useStore((s) => s.set);
  return (
    <TopBarContainer className="titlebar" data-tauri-drag-region>
      <FiMenu
        onClick={() => set({ showSide: !showSide })}
        style={{ opacity: showSide ? 1 : 0.3, cursor: "pointer" }}
      />
      <Spacer />
      <div>{filePath ? removeExt(basename(filePath)) : "Fragment"}</div>
      <Spacer />
    </TopBarContainer>
  );
};
