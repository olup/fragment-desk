import { FC, useRef, useState } from "react";
import { DropTargetMonitor, useDrag, useDrop, XYCoord } from "react-dnd";

export const DraggableItem: FC<{
  type: string;
  id: string;
  index: number;
  canCombine?: boolean;
  move?: (id: string, to: number) => void;
  combine?: (fromId: string, toId: string) => void;
}> = ({ children, type, index, id, move, canCombine, combine }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isTargeted, setIsTargeted] = useState(false);

  const [{ handlerId, isOver }, drop] = useDrop({
    accept: type,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
        isOver: monitor.isOver(),
      };
    },
    drop(item: any) {
      isTargeted && combine?.(item.id, id);
    },
    hover(item: any, monitor: DropTargetMonitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      // Don't replace items with themselves
      if (id === item.id) {
        return;
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect();

      // Get vertical middle
      let lowThres = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      let highTres = lowThres;

      // Determine mouse position
      const clientOffset = monitor.getClientOffset();

      // Get pixels to the top
      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top;

      if (canCombine) {
        lowThres = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 3;
        highTres = lowThres * 2;

        if (hoverClientY > lowThres && hoverClientY < highTres) {
          if (!isTargeted) setIsTargeted(true);
        } else {
          if (isTargeted) setIsTargeted(false);
        }
      }

      if (dragIndex < hoverIndex && hoverClientY < highTres) {
        return;
      }

      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > lowThres) {
        return;
      }

      move?.(item.id, hoverIndex);
      item.index = hoverIndex;
    },
  });

  if (!isOver && isTargeted) setIsTargeted(false);

  const [{ isDragging }, drag] = useDrag({
    type: "file",
    item: { id, index },
    collect: (monitor: any) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const opacity = isDragging ? 0 : 1;
  const borderLeft = isTargeted ? "3px solid #222" : "none";
  drag(drop(ref));

  return (
    <div
      ref={ref}
      style={{ opacity, borderLeft, boxSizing: "border-box" }}
      data-handler-id={handlerId}
    >
      {children}
    </div>
  );
};
