import { defaultKeymap } from "@codemirror/commands";
import { classHighlightStyle } from "@codemirror/highlight";
import { markdownKeymap, markdownLanguage } from "@codemirror/lang-markdown";
import { EditorState, Text } from "@codemirror/state";
import { EditorView, keymap, placeholder } from "@codemirror/view";
import { styled } from "theme";
import { FC, useEffect, useRef, useState } from "react";
import { useDebouncedCallback } from "use-debounce/lib";
import { useStore } from "hooks/store";

function updatePos() {
  let x = 0,
    y = 0;
  const isSupported = typeof window.getSelection !== "undefined";
  if (isSupported) {
    const selection = window.getSelection();
    if (!selection) return { x: 0, y: 0 };
    if (selection.rangeCount !== 0) {
      const range = selection.getRangeAt(0).cloneRange();
      range.collapse(true);
      const rects = range.getClientRects();

      if (!rects.length) {
        // probably new line buggy behavior
        if (range.startContainer && range.collapsed) {
          range.selectNodeContents(range.startContainer);
        }
      }

      const rect = range.getClientRects()[0];
      if (rect) {
        x = rect.left;
        y = rect.top;
      }
    }
  }

  const caretPos = y;
  const bottomTreshold = (window.outerHeight / 3) * 2;
  const topTreshold = bottomTreshold - 50;
  const scroller = document.getElementById("main-scroll");
  if (caretPos > bottomTreshold) {
    const offset = caretPos - bottomTreshold;
    scroller?.scroll({ top: scroller?.scrollTop + offset });
  }
  if (caretPos < topTreshold) {
    const offset = topTreshold - caretPos;
    scroller?.scroll({ top: scroller?.scrollTop - offset });
  }
  return { x, y };
}

const EditoContainer = styled("div", {
  width: "100%",
  fontSize: 18,
  ".cmt-meta": {
    opacity: 0.3,
  },
  ".cmt-heading": {
    fontWeight: "bold",
    fontSize: 20,
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
    "line-height": 1.5,
    paddingBottom: 10,
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

  if (editor.current)
    editor.current.onkeydown = (e) => {
      if (useStore.getState().scrollMode) updatePos();
    };

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
          setState(() => update.state.doc.toString());
        }),
        //@ts-ignore
        keymap.of(markdownKeymap),
        //@ts-ignore
        keymap.of(defaultKeymap),
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
