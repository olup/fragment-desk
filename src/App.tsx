import { FileEditor } from "components/FileEditor";
import { InfoBar } from "components/InfoBar";
import { SideBar } from "components/SideBar";
import { Box } from "components/ui/Layout";
import { ScrollArea } from "components/ui/ScrollArea";
import { useStore } from "hooks/store";
import React from "react";
import { reset } from "stitches-reset";
import { global, styled } from "theme";
import { removeExt } from "utils";
import "../node_modules/@fontsource/merriweather/latin-300.css";
import "../node_modules/@fontsource/montserrat";
import "../node_modules/@fontsource/inconsolata";
import { TopBar } from "./components/TopBar";
import { invoke } from "@tauri-apps/api/tauri";

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
              marginTop: -30,
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
                {(filePaths?.length &&
                  filePaths.map((path, index) => (
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
                      <FileEditor path={path} key={path} />
                    </>
                  ))) || <FileEditor path={""} key={""} />}
              </div>
            </ScrollArea>
          </div>
        </div>
        {showInfo && (
          <div
            style={{
              position: "relative",
              minWidth: 200,
              marginTop: -30,
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
