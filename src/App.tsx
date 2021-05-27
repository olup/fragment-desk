import { writeFile } from "@tauri-apps/api/fs";
import { invoke } from "@tauri-apps/api/tauri";
import { SideBar } from "components/SideBar";
import { Box, Flex } from "components/ui/Layout";
import { ScrollArea } from "components/ui/ScrollArea";
import { useStore } from "hooks/store";
import React, { useCallback, useEffect, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { reset } from "stitches-reset";
import { global, styled } from "theme";
import { File } from "types";
import { Editor } from "./components/Editor";
import { TopBar } from "./components/TopBar";

import "../node_modules/@fontsource/ubuntu-mono";
import "../node_modules/@fontsource/montserrat";
import "../node_modules/@fontsource/merriweather/latin-300.css";

const globalStyles = global(reset);
const globalStylesExtension = global({
  body: {
    "*": {
      // fontFamily: '"Ubuntu Mono"',
    },
  },
});

const AppContainer = styled(Box, {
  minHeight: "100vh",
  boxSizing: "border-box",
  display: "flex",
  flexDirection: "column",
});

function App() {
  globalStyles();
  globalStylesExtension();
  const filePath = useStore((s) => s.currentFilePath);
  const content = useStore((s) => s.content);
  const showSide = useStore((s) => s.showSide);
  const set = useStore((s) => s.set);

  const [loading, setLoading] = useState(false);

  const loadFile = useCallback(async (path?: string) => {
    if (!path) return;
    setLoading(true);
    try {
      const file = await invoke<File>("open_file", { path });
      set({ currentFilePath: path, content: file.content || "" });
    } catch (err) {
      alert("An error happened opening " + filePath);
    }
    setLoading(false);
  }, []);

  const onSave = async (contents: string) => {
    if (!filePath) return;
    await writeFile({ path: filePath, contents });
  };

  useEffect(() => {
    if (!filePath) return;
    loadFile(filePath);
  }, [filePath]);

  useHotkeys("ctrl+s", () => {
    onSave(content);
  });

  return (
    <AppContainer>
      <TopBar />
      <div style={{ display: "flex", flex: 1 }}>
        {showSide && (
          <div
            style={{
              position: "relative",
              minWidth: 300,
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
              }}
            >
              <SideBar />
            </div>
          </div>
        )}
        <div
          style={{
            flex: 1,
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
            }}
          >
            <ScrollArea>
              <div style={{ padding: 20, maxWidth: 800, margin: "0 auto" }}>
                {!loading && (
                  <Editor
                    key={filePath}
                    initialValue={content}
                    onSave={(c) => onSave(c)}
                  />
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </AppContainer>
  );
}

export default App;
