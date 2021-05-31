import { FC, useState, KeyboardEvent, useCallback, FocusEvent } from "react";
import { HiDotsVertical } from "react-icons/hi";
import {
  VscEdit,
  VscFile,
  VscFiles,
  VscKebabVertical,
  VscRemove,
  VscTrash,
} from "react-icons/vsc";
import { styled } from "theme";
import { removeExt } from "utils";
import { Icon } from "./ui/Icon";
import { Content, Menu, Trigger, Item, ItemIcon } from "./ui/Menu";

const Reveal = styled("div", {
  opacity: 0,
});

const FileStyled = styled("div", {
  display: "Flex",
  width: "100%",
  userSelect: "none",
  borderBottom: "1px solid #eee",
  borderTop: "1px solid #eee",
  padding: 10,
  boxSizing: "border-box",
  cursor: "pointer",
  marginTop: -1,
  position: "relative",
  zIndex: 0,
  opacity: 0.5,
  backgroundColor: "#fff",
  "&:hover": {
    opacity: 1,
    [`${Reveal}`]: {
      opacity: 1,
    },
    zIndex: 10,
  },
  variants: {
    selected: {
      true: {
        opacity: 1,
        boxShadow: "5px 0 0 #2d7be0 inset",
        zIndex: 10,
      },
    },
  },
});

const NameInput = styled("input", {
  fontFamily: "Montserrat",
  margin: 0,
  borderRadius: 0,
  border: "1px solid #ccc",
  padding: 0,
  marginTop: -2,
  width: "100%",
});

const FileContentStyled = styled("div", {
  fontSize: 12,
  opacity: 0.5,
});
export const FileItem: FC<{
  name: string;
  description?: string;
  isEditMode?: boolean;
  selected?: boolean;
  type: "file" | "collection";
  path: string;
  onSelect?: (path: string) => void;
  onDelete?: (path: string) => void;
  onChangeName?: (newName: string, path: string) => void;
  onCancel?: () => void;
  dragHandle?: any;
}> = ({
  name,
  description,
  isEditMode,
  type,
  onSelect,
  onDelete,
  path,
  selected,
  onChangeName,
  onCancel,
  dragHandle,
}) => {
  const [isEditModeLocal, setIsEditModeMLocal] = useState(false);
  const onValidateInput = (value: string) => {
    onChangeName?.(value, path);
  };
  const autoFocus = useCallback((el) => (el ? el.focus() : null), []);

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onValidateInput(e.currentTarget.value);
      setIsEditModeMLocal(false);
    }
    if (e.key === "Escape") {
      setIsEditModeMLocal(false);
      onCancel?.();
    }
  };

  const onBlur = (e: FocusEvent<HTMLInputElement>) => {
    setIsEditModeMLocal(false);
    onCancel?.();
  };

  return (
    <FileStyled onClick={() => onSelect?.(path)} selected={selected}>
      <div style={{ marginRight: 10 }} ref={dragHandle}>
        <Icon as={type === "file" ? VscFile : VscFiles} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ marginBottom: 5 }}>
          {!isEditMode && !isEditModeLocal ? (
            name
          ) : (
            <NameInput
              onKeyDown={onKeyDown}
              defaultValue={name}
              ref={autoFocus}
              onBlur={onBlur}
            />
          )}
        </div>
        {description && <FileContentStyled>{description}</FileContentStyled>}
      </div>
      {!isEditMode && !isEditModeLocal && (
        <Reveal>
          <Menu>
            <Trigger>
              <VscKebabVertical />
            </Trigger>
            <Content>
              <Item onSelect={() => setIsEditModeMLocal(true)}>
                <ItemIcon as={VscEdit} />
                Rename
              </Item>
              <Item onSelect={() => onDelete?.(path)}>
                <ItemIcon as={VscTrash} /> Delete
              </Item>
            </Content>
          </Menu>
        </Reveal>
      )}
    </FileStyled>
  );
};
