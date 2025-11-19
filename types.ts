
export interface EntityData {
  title: string;
  content: string;
  color?: string;
  onDataChange?: (id: string, field: 'title' | 'content', value: string) => void;
}

export enum NodeType {
  ENTITY = 'entityNode',
}

export const DEFAULT_NODE_COLOR = '#ffffff';
export const SELECTED_NODE_BORDER = '#2563eb';

// Action Types for Bot operations
export type CanvasActionType = 'add_node' | 'update_node' | 'delete_node' | 'add_edge' | 'delete_edge';

export interface CanvasAction {
  type: CanvasActionType;
  payload: any;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model' | 'system';
  text?: string;
  isProposal?: boolean;
  proposedActions?: CanvasAction[];
  isExecuted?: boolean;
}
