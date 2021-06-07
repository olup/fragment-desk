import { save } from "@tauri-apps/api/dialog";
import { writeFile } from "@tauri-apps/api/fs";
import { useStore } from "hooks/store";
import { keyframes, styled } from "theme";
import { compileFiles } from "utils";

const Side = keyframes({
  "0%": { transform: "translateX(50px)", opacity: 0 },
  "100%": { transform: "translateX(0)", opacity: 1 },
});

const InfoBarStyled = styled("div", {
  backgroundColor: "#eee",
  fontFamily: "Monserrat",
  height: "100%",
  paddingTop: 30,
  animation: `.1s ${Side}`,
});

const Section = styled("div", {
  padding: 10,
  fontSize: 12,
});

const Button = styled("div", {
  fontFamily: "Montserrat",
  textAlign: "center",
  border: "1px solid #ccc",
  cursor: "pointer",
  padding: 7,
  borderRadius: 3,
  "&:hover": {
    backgroundColor: "#ddd",
    borderColor: "#ccc",
  },
});
export const InfoBar = () => {
  const paths = useStore((s) => s.currentFilePaths);
  const content = "";
  const wc = content.split(" ").length;
  const cc = content.length;

  const onCompileToText = async () => {
    const contents = await compileFiles(paths || []);
    const path = await save();
    await writeFile({ path, contents });
  };

  return (
    <InfoBarStyled>
      {/* <Section>
        {wc} words / {cc} chars
      </Section> */}
      <Section>
        <Button onClick={onCompileToText}>Compile as Text</Button>
      </Section>
    </InfoBarStyled>
  );
};
