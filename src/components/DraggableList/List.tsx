import { FC, ReactNode } from "react";
import { useDragLayer } from "react-dnd";
import { styled } from "theme";
import { DraggableItem } from "./Element";

const Layer = styled("div", {
  position: "absolute",
  top: 0,
  left: 0,
  bottom: 0,
  right: 0,
});

export const DraggableList: FC<{
  forType: string;
  elements: any[];
  render: (element: any, handle?: any) => ReactNode;
  onSortChange?: (elements: any[]) => void;
  onCombine?: (fromId: string, toId: string) => void;
}> = ({ forType, elements, render, onSortChange, onCombine }) => {
  const onChangePos = (id: string, pos: number) => {
    const el = elements.find((el) => el.id === id);
    const without = elements.filter((el) => el.id !== id);
    without.splice(pos, 0, el);
    onSortChange?.(without);
  };

  const { isDragging, element, initialOffset, currentOffset } = useDragLayer(
    (monitor) => {
      return {
        isDragging: monitor.isDragging(),
        element: monitor.getItem(),

        initialOffset: monitor.getInitialSourceClientOffset(),
        currentOffset: monitor.getSourceClientOffset(),
      };
    }
  );

  const { x, y } = currentOffset || { x: 0, y: 0 };

  const transform = `translate(${x}px, ${y - 40}px) rotate(10deg)`;

  const selectedItem = element
    ? elements.find((el) => el.id === element.id)
    : null;

  return (
    <div>
      {/* {isDragging && (
        <Layer>
          {selectedItem && (
            <div
              style={{
                transform,
                WebkitTransform: transform,
                zIndex: 1000,
                backgroundColor: "#fff",
                position: "relative",
              }}
            >
              {render(selectedItem)}
            </div>
          )}
        </Layer>
      )} */}
      {elements.map((e, index) => (
        <DraggableItem
          type={forType}
          id={e.id}
          key={e.id}
          index={index}
          canCombine={e.canCombine}
          move={onChangePos}
          combine={onCombine}
          element={e}
          render={render}
        />
      ))}
    </div>
  );
};
