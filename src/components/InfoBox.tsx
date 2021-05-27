import { useStore } from "hooks/store";
import { keyframes, styled } from "theme";

const scaleIn = keyframes({
  "0%": { opacity: 0, transform: "scale(.9)" },
  "100%": { opacity: 1, transform: "scale(1)" },
});

const InfoBoxStyled = styled("div", {
  padding: 20,
  border: "1px solid #ccc",
  width: 180,
  position: "fixed",
  backgroundColor: "#fff",
  top: 29,
  right: 20,
  fontFamily: "Monserrat",
  animation: `.2s ${scaleIn} ease-out`,
});
export const InfoBox = () => {
  const content = useStore((s) => s.content);
  const wc = content.split(" ").length;
  const cc = content.length;
  return (
    <InfoBoxStyled>
      <div style={{ display: "flex" }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, color: "#2d7be0" }}>{wc}</div>{" "}
          <div style={{ textTransform: "uppercase", fontSize: 12 }}>Words</div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, color: "#2d7be0" }}>{cc}</div>
          <div style={{ textTransform: "uppercase", fontSize: 12 }}>
            {" "}
            Characters
          </div>
        </div>
      </div>
    </InfoBoxStyled>
  );
};
