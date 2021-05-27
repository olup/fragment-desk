import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/tauri";
import { useEffect } from "react";

export const useDirectoryWatch = (path: string, cb: (path: string) => void) => {
  useEffect(() => {
    invoke("watch", { path });
    return () => {
      invoke("unwatch", { path });
    };
  }, [path]);

  useEffect(() => {
    let stop: any;
    listen<string>("file_changed", (event) => {
      cb(event.payload);
    }).then((fn) => {
      stop = fn;
    });
    return () => {
      stop?.();
    };
  }, [path, cb]);
};
