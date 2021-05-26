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
});
export const InfoBox = () => {
  const content = useStore((s) => s.content);
  const wc = content.split(" ").length;
  const cc = content.length;
  return (
    <InfoBoxStyled>
      <div>{wc} Words</div>
      <div>{cc} Characters</div>
    </InfoBoxStyled>
  );
};
