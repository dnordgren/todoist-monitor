export enum TodoistEventType {
  Completed = 'completed',
}

export enum TodoistObjectType {
  Item = 'item',
}

export interface TodoistEvent {
  event_date: TodoistEventType;
  event_type: string;
  extra_data: Record<string, unknown>;
  id: number;
  initiator_id: number | null;
  object_id: number;
  object_type: TodoistObjectType;
  parent_item_id: number | null;
  parent_project_id: number | null;
}

export interface TodoistActivityLog {
  count: number;
  events: TodoistEvent[];
}
