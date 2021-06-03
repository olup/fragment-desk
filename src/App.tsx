import { writeFile } from "@tauri-apps/api/fs";
import { FileEditor } from "components/FileEditor";
import { InfoBar } from "components/InfoBar";
import { SideBar } from "components/SideBar";
import { Box } from "components/ui/Layout";
import { ScrollArea } from "components/ui/ScrollArea";
import { useStore } from "hooks/store";
import React, { useEffect } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import LazyLoad from "react-lazyload";
import { reset } from "stitches-reset";
import { global, styled } from "theme";
import { removeExt } from "utils";
import "../node_modules/@fontsource/merriweather/latin-300.css";
import "../node_modules/@fontsource/montserrat";
import "../node_modules/@fontsource/ubuntu-mono";
import { TopBar } from "./components/TopBar";

const globalStyles = global(reset);
const globalStylesExtension = global({
  body: {
    borderRadius: 8,
    backgroundColor: "#fff",
    overflow: "hidden",
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

  const filePaths = useStore((s) => s.currentFilePaths);
  const showSide = useStore((s) => s.showSide);
  const showInfo = useStore((s) => s.showInfo);

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
                {filePaths?.map((path, index) => (
                  <>
                    {index !== 0 && (
                      <div
                        style={{
                          height: 0,
                          width: "100%",
                          borderTop: "2px dashed #eee",
                          margin: "10px 0",
                          position: "relative",
                        }}
                      >
                        <div
                          style={{
                            position: "absolute",
                            top: -9,
                            backgroundColor: "#fff",
                            color: "#ccc",
                            paddingRight: 7,
                          }}
                        >
                          {removeExt(path)}
                        </div>
                      </div>
                    )}
                    <LazyLoad height={100} key={path} offset={100}>
                      <FileEditor path={path} key={path} />
                    </LazyLoad>
                  </>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
        {showInfo && (
          <div
            style={{
              position: "relative",
              minWidth: 200,
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
              <InfoBar />
            </div>
          </div>
        )}
      </div>
    </AppContainer>
  );
}

export default App;
