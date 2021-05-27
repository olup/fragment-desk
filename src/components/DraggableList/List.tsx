import { FC, ReactNode } from "react";
import { DraggableItem } from "./Element";

export const DraggableList: FC<{
  forType: string;
  elements: any[];
  render: (element: any) => ReactNode;
  onSortChange?: (elements: any[]) => void;
}> = ({ forType, elements, render, onSortChange }) => {
  const onChangePos = (id: string, pos: number) => {
    const el = elements.find((el) => el.id === id);
    const without = elements.filter((el) => el.id !== id);
    without.splice(pos, 0, el);
    onSortChange?.(without);
  };

  return (
    <div>
      {elements.map((e, index) => (
        <DraggableItem
          type={forType}
          id={e.id}
          key={e.id}
          index={index}
          move={onChangePos}
        >
          {render(e)}
        </DraggableItem>
      ))}
    </div>
  );
};
