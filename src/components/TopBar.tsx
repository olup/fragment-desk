import { styled } from "theme";
import { FC } from "react";
import { FiMenu } from "react-icons/fi";
import { Box } from "./ui/Layout";
import { Icon } from "./ui/Icon";
import { Spacer } from "./ui/Spacer";
import { basename } from "path";
import { useAppStore } from "hooks/appStore";
import { css } from "@stitches/react";
import { useStore } from "hooks/store";
import { removeExt } from "utils";

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
      <Icon
        as={FiMenu}
        onClick={() => set({ showSide: !showSide })}
        cursor="pointer"
        style={{ opacity: showSide ? 1 : 0.3 }}
      />
      <Spacer />
      <Box>{filePath ? removeExt(basename(filePath)) : "Fragment"}</Box>
      <Spacer />
    </TopBarContainer>
  );
};
