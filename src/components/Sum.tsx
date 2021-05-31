export const Sum = () => {
  const content = "";
  const wc = content.split(" ").length;
  const cc = content.length;
  return (
    <>
      <div>{wc} Words</div>
      <div>{cc} Characters</div>
    </>
  );
};
