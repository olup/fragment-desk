import { styled } from "theme";
import * as RadixTooltip from "@radix-ui/react-tooltip";
import { FC, ReactNode } from "react";

const StyledContent = styled(RadixTooltip.Content, {
  borderRadius: 1,
  padding: "5px 10px",
  fontSize: 14,
  backgroundColor: "#222",
  color: "white",
});

const StyledArrow = styled(RadixTooltip.Arrow, {
  fill: "gainsboro",
});

export const Tooltip: FC<{ label: ReactNode | string }> = ({
  label,
  children,
}) => (
  <RadixTooltip.Root>
    <RadixTooltip.Trigger as="div">{children}</RadixTooltip.Trigger>
    <StyledContent align="center">{label}</StyledContent>
  </RadixTooltip.Root>
);
