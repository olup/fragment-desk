import { keyframes, styled } from "theme";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { FC, ReactNode } from "react";

const scaleIn = keyframes({
  "0%": { opacity: 0, transform: "scale(.9)" },
  "100%": { opacity: 1, transform: "scale(1)" },
});

export const Content = styled(DropdownMenu.Content, {
  minWidth: 130,
  backgroundColor: "white",
  borderRadius: 3,
  padding: "10px 0",
  overflow: "hidden",
  boxShadow: "0px 0px 15px  hsla(206,22%,7%,.15)",
  border: "1px solid #ddd",
  animation: `.2s ${scaleIn} ease-out`,
});

export const Item = styled(DropdownMenu.Item, {
  fontSize: 14,
  padding: "10px 20px",
  cursor: "pointer",

  "&:focus": {
    outline: "none",
    backgroundColor: "#eee",
    // color: "white",
  },
});

export const Menu = DropdownMenu.Root;
export const Trigger = styled(DropdownMenu.Trigger, {
  cursor: "pointer",
  padding: 0,
  margin: 0,
  border: "none",
  backgroundColor: "transparent",
  outline: "none",
  fontSize: "inherit",
});
