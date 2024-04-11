import React from 'react';
import type { DraggableId, DroppableId, TypeId } from '../../types';

export interface DroppableContextValue {
  isUsingCloneFor: DraggableId | null;
  droppableId: DroppableId;
  type: TypeId;
  shouldRenderOriginal: boolean;
}

export default React.createContext<DroppableContextValue | null>(null);
