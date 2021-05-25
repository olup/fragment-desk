import create from "zustand";
import { combine } from "zustand/middleware";

export const useStore = create(
  combine(
    {
      content: "",
      currentFilePath: "",
      currentProjectPath: "",
      currentDirectoryPath: "",

      showSide: false,
    },
    (set) => ({
      set,
    })
  )
);
