import * as RadixPopover from "@radix-ui/react-popover";
import { FC, ReactNode } from "react";
import { FiX } from "react-icons/fi";
import { keyframes, styled } from "theme";

const scaleIn = keyframes({
  "0%": { opacity: 0, transform: "scale(1) translateY(-20px)" },
  "100%": { opacity: 1, transform: "scale(1) translateY(0px)" },
});

const StyledContent = styled(RadixPopover.Content, {
  borderRadius: 5,
  padding: 20,
  paddingTop: 30,
  backgroundColor: "#fff",
  border: "1px solid #ccc",
  boxShadow: " 0 0 10px rgba(0,0,0,.2)",
  width: 200,

  transformOrigin: "var(--radix-popover-content-transform-origin)",
  animation: `${scaleIn} 0.2s`,
});

const StyledClose = styled(RadixPopover.Close, {
  position: "absolute",
  top: 5,
  left: 5,
  opacity: 0.5,
  fontSize: 14,
  cursor: "pointer",
});

export const Popover: FC<{ trigger: ReactNode }> = ({ trigger, children }) => (
  <RadixPopover.Root>
    <RadixPopover.Trigger as="div">{trigger}</RadixPopover.Trigger>
    <StyledContent>
      <StyledClose as="div">
        <FiX />
      </StyledClose>
      {children}
    </StyledContent>
  </RadixPopover.Root>
);
