import { FC, PropsWithRef } from "react";

export const Separator: FC<{ title: string; onClick?: () => void }> = ({
  title,
  onClick,
}) => {
  return (
    <div
      style={{
        height: 0,
        width: "100%",
        borderTop: "1px dashed rgba(0,0,0,.05)",
        margin: "20px 0",
        position: "relative",
      }}
    >
      <div
        onClick={onClick}
        style={{
          position: "absolute",
          top: "-50%",
          left: "50%",
          transform: "translateX(-50%) translateY(-50%)",
          backgroundColor: "#fff",
          color: "rgba(0,0,0,.1)",
          paddingRight: 7,
          fontSize: 12,
          cursor: "pointer",
        }}
      >
        {title}
      </div>
    </div>
  );
};
