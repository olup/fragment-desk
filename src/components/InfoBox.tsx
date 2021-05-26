import { useStore } from "hooks/store";
import { styled } from "theme";

const InfoBoxStyled = styled("div", {
  padding: 20,
  border: "1px solid #ccc",
  width: 180,
  position: "fixed",
  backgroundColor: "#fff",
  top: 29,
  right: 20,
  fontFamily: "Monserrat",
});
export const InfoBox = () => {
  const content = useStore((s) => s.content);
  const wc = content.split(" ").length;
  const cc = content.length;
  return (
    <InfoBoxStyled>
      <div style={{ display: "flex" }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 18, color: "#2d7be0" }}>{wc}</div>{" "}
          <div style={{ textTransform: "uppercase" }}>Words</div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 18, color: "#2d7be0" }}>{cc}</div>
          <div style={{ textTransform: "uppercase" }}> Characters</div>
        </div>
      </div>
    </InfoBoxStyled>
  );
};
