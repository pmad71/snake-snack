import { Direction } from '../types';

export const detectSwipe = (
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  minDistance: number = 20
): Direction | null => {
  const deltaX = endX - startX;
  const deltaY = endY - startY;
  const absX = Math.abs(deltaX);
  const absY = Math.abs(deltaY);

  if (absX < minDistance && absY < minDistance) {
    return null;
  }

  if (absX > absY) {
    return deltaX > 0 ? 'RIGHT' : 'LEFT';
  } else {
    return deltaY > 0 ? 'DOWN' : 'UP';
  }
};
