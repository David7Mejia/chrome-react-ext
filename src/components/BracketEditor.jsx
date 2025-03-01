import React, { useEffect, useRef } from "react";
import "prosemirror-view/style/prosemirror.css";
import { EditorState, Plugin, TextSelection } from "prosemirror-state";
import { EditorView, Decoration, DecorationSet } from "prosemirror-view";
import { schema as basicSchema } from "prosemirror-schema-basic";
import { history } from "prosemirror-history";
import { baseKeymap } from "prosemirror-commands";
import { keymap } from "prosemirror-keymap";
import "../styles/BracketEditor.css";

function bracketHighlighterPlugin() {
  return new Plugin({
    props: {
      decorations(state) {
        const { doc } = state;
        const decos = [];
        doc.descendants((node, pos) => {
          if (!node.isText) return;
          const text = node.text;
          const bracketRegex = /\[(.*?)\]/g;
          let match;
          while ((match = bracketRegex.exec(text)) !== null) {
            const start = pos + match.index;
            const end = start + match[0].length;
            decos.push(
              Decoration.inline(start, end, {
                style: "color: red; font-weight: bold;",
              })
            );
          }
        });
        return DecorationSet.create(doc, decos);
      },
    },
  });
}

function placeholderPlugin(placeholderText) {
  return new Plugin({
    props: {
      decorations(state) {
        const { doc } = state;
        // We'll consider it "empty" if there's only one empty textblock
        const empty = doc.childCount === 1 && doc.firstChild.isTextblock && doc.firstChild.content.size === 0;

        if (empty) {
          // We'll insert a widget decoration at position 1
          // (the start of the document) that displays the placeholder text.
          const deco = Decoration.widget(1, () => {
            const span = document.createElement("span");
            span.style.opacity = "0.5";
            span.style.pointerEvents = "none";
            span.style.userSelect = "none";
            span.textContent = placeholderText;
            return span;
          });
          return DecorationSet.create(doc, [deco]);
        }
        return null;
      },
    },
  });
}

export default function BracketEditor({ selectedTab }) {
  const editorRef = useRef(null);
  const pmViewRef = useRef(null);

  // useEffect(() => {}, [selectedTab]);
  useEffect(() => {
    // Confirm our ref is in DOM
    if (!editorRef.current) return;

    // Construct initial EditorState
    const editorState = EditorState.create({
      schema: basicSchema,
      plugins: [history(), keymap(baseKeymap), bracketHighlighterPlugin(), placeholderPlugin(selectedTab === 0 ? "Type your Prompt" : "Ask Assistant")],
    });

    // Create EditorView
    const view = new EditorView(editorRef.current, {
      state: editorState,
      dispatchTransaction(tr) {
        // Apply transaction
        const newState = view.state.apply(tr);
        view.updateState(newState);
      },
    });

    pmViewRef.current = view;

    // Cleanup on unmount
    return () => {
      view.destroy();
    };
  }, [selectedTab]);

  return (
    <div className="gradient-border-wrapper">
      <div className="pm-editor-container" ref={editorRef} placeholder="hello" />
    </div>
  );
}
