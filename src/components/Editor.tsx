import { defaultKeymap } from "@codemirror/commands";
import { classHighlightStyle } from "@codemirror/highlight";
import { markdownKeymap, markdownLanguage } from "@codemirror/lang-markdown";
import { EditorState } from "@codemirror/state";
import { EditorView, keymap, placeholder } from "@codemirror/view";
import { styled } from "theme";
import { FC, useEffect, useRef, useState } from "react";
import { useDebouncedCallback } from "use-debounce/lib";
import { useStore } from "hooks/store";

const EditoContainer = styled("div", {
  width: "100%",
  fontSize: 16,
  ".cmt-meta": {
    opacity: 0.3,
  },
  ".cmt-heading": {
    fontWeight: "bold",
    color: "rgb(46, 91, 196)",
    "&.cmt-meta": {
      opacity: 1,
    },
  },
  ".cmt-emphasis": {
    fontStyle: "italic",
  },
  ".cmt-strong": {
    fontWeight: "bold",
  },
  ".cm-focused": {
    outline: "none",
  },
  ".cm-line": {
    fontFamily: "Inconsolata",
    padding: 0,
    "line-height": 1.8,
    "&:last-of-type": {
      paddingBottom: 0,
    },
  },
});

type EditorProps = {
  initialValue?: string;
  onChange?: (content: string) => any;
  onSave?: (content: string) => any;
  placeholder?: string;
};
export const Editor: FC<EditorProps> = ({
  onSave,
  initialValue = "",
  placeholder: placeholderText,
}) => {
  const [state, setState] = useState(initialValue);
  const set = useStore((s) => s.set);

  const editor = useRef<HTMLDivElement | null>(null);

  // initialize view
  useEffect(() => {
    if (!editor.current) return;

    let startState = EditorState.create({
      doc: initialValue,
      extensions: [
        markdownLanguage,
        classHighlightStyle,
        placeholder(placeholderText || "..."),
        EditorView.lineWrapping,
        EditorView.updateListener.of((update) => {
          console.log(update);
          setState(() => update.state.doc.toString());
        }),
        // keymap.of(markdownKeymap),
        // keymap.of(defaultKeymap),
        keymap.of([
          {
            key: "Ctrl-s",
            run: (view) => {
              onSave?.(view.state.doc.toString());
              return true;
            },
          },
        ]),
      ],
    });

    let view = new EditorView({
      state: startState,
      parent: editor.current,
    });

    return () => {
      view.destroy();
    };
  }, [editor]);

  return (
    <EditoContainer>
      <div ref={editor} />
    </EditoContainer>
  );
};
