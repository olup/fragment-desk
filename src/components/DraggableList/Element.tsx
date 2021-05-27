import { FC, useRef } from "react";
import { DropTargetMonitor, useDrag, useDrop, XYCoord } from "react-dnd";

export const DraggableItem: FC<{
  type: string;
  id: string;
  index: number;
  move?: (id: string, to: number) => void;
}> = ({ children, type, index, id, move }) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ handlerId }, drop] = useDrop({
    accept: type,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: any, monitor: DropTargetMonitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect();

      // Get vertical middle
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      // Determine mouse position
      const clientOffset = monitor.getClientOffset();

      // Get pixels to the top
      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top;

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%

      // Dragging downwards
      let to = hoverIndex;
      if (hoverClientY < hoverMiddleY) {
        return;
      }

      // Dragging upwards
      if (hoverClientY > hoverMiddleY) {
        to = hoverIndex + 1;
      }

      // Time to actually perform the action
      move?.(item.id, hoverIndex);
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: "file",
    item: { id, index },
    collect: (monitor: any) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const opacity = isDragging ? 0 : 1;

  drag(drop(ref));

  return (
    <div ref={ref} style={{ opacity }} data-handler-id={handlerId}>
      {children}
    </div>
  );
};
