import { save } from "@tauri-apps/api/dialog";
import { writeFile } from "@tauri-apps/api/fs";
import { useStore } from "hooks/store";
import { styled } from "theme";
import { compileFiles } from "utils";

const InfoBarStyled = styled("div", {
  borderLeft: "1px solid #ccc",
  backgroundColor: "#fff",
  fontFamily: "Monserrat",
  height: "100%",
});

const Section = styled("div", {
  borderBottom: "1px solid #ccc",
  padding: 10,
  fontSize: 12,
});

const Button = styled("div", {
  textAlign: "center",
  border: "1px solid #eee",
  cursor: "pointer",
  padding: 7,
  borderRadius: 3,
  "&:hover": {
    backgroundColor: "#eee",
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
