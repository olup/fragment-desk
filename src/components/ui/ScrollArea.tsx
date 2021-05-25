import { styled } from "theme";
import {
  Viewport,
  ScrollbarY,
  Root,
  Track,
  Thumb,
  SCROLL_AREA_CSS_PROPS,
} from "@radix-ui/react-scroll-area";
import { FC } from "react";

const Container = styled("div", {
  flex: 1,
  height: "100%",
});

const StyledScrollArea = styled(Root, {
  position: "relative",
  height: "100%",
  zIndex: 0,
  "& [data-radix-scroll-area-viewport-position]::-webkit-scrollbar": {
    display: "none",
  },
});

const StyledViewport = styled(Viewport, {
  zIndex: 1,
  position: "relative",
});

const StyledScrollbarY = styled(ScrollbarY, {
  zIndex: 2,
  position: "absolute",
  userSelect: "none",
  transition: "300ms opacity ease",
  width: 8,
  right: 0,
  top: 0,
  bottom: 0,
});

const StyledTrack = styled(Track, {
  zIndex: -1,
  position: "relative",
  width: "100%",
  height: "100%",
});

const StyledThumb = styled(Thumb, {
  backgroundColor: "#222",
  opacity: 0.5,
  position: "absolute",
  top: 0,
  left: 0,
  userSelect: "none",
  // borderRadius: 9999,
  willChange: `var(${SCROLL_AREA_CSS_PROPS.scrollbarThumbWillChange})`,
  height: `var(${SCROLL_AREA_CSS_PROPS.scrollbarThumbHeight})`,
  width: `var(${SCROLL_AREA_CSS_PROPS.scrollbarThumbWidth})`,
});

export const ScrollArea: FC = ({ children }) => (
  <Container>
    <StyledScrollArea>
      <StyledViewport>{children}</StyledViewport>
      <StyledScrollbarY>
        <StyledTrack>
          <StyledThumb />
        </StyledTrack>
      </StyledScrollbarY>
    </StyledScrollArea>
  </Container>
);
