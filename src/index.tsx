import { register } from "@tauri-apps/api/globalShortcut";
import { AppStoreProvider } from "hooks/appStore";
import React from "react";
import { HTML5Backend } from "react-dnd-html5-backend";
import { DndProvider } from "react-dnd";
import ReactDOM from "react-dom";
import App from "./App";
import { TopBar } from "./components/TopBar";
import reportWebVitals from "./reportWebVitals";

ReactDOM.render(
  <React.StrictMode>
    <AppStoreProvider>
      <DndProvider backend={HTML5Backend}>
        <App />
      </DndProvider>
    </AppStoreProvider>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
