import create from "zustand";
import { combine } from "zustand/middleware";
import { persist } from "zustand/middleware";

export const useStore = create(
  persist(
    combine(
      {
        content: "",
        currentFilePath: "",
        currentProjectPath: "",
        currentDirectoryPath: "",

        showSide: false,
        showInfo: false,
        showAddItem: false as "file" | "collection" | false,

        topbarStyle: "standard" as "standard" | "macos",
      },
      (set) => ({
        set,
      })
    ),
    {
      name: "store", // unique name
    }
  )
);
