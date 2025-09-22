// Shared types for learning path components

export interface SelectedContent {
  type: 'project' | 'concept' | 'subconcept' | 'subtopic' | 'task';
  title: string;
  description: string;
  verification_type?: string;
  is_verified?: boolean;
  id?: string | number;
}

export interface Concept {
  id: number;
  name: string;
  description: string;
  isUnlocked: boolean;
  subTopics: Subtopic[]; // Legacy - for backward compatibility
  subconcepts?: Subconcept[]; // New - for subconcept hierarchy
  day_number?: number;
}

export interface Subconcept {
  id: number;
  name: string;
  description: string;
  isUnlocked: boolean;
  isCompleted: boolean;
  task: Task; // Each subconcept has exactly 1 task
}

export interface Subtopic {
  id: number;
  name: string;
  description: string;
  isUnlocked: boolean;
  tasks: Task[];
}

export interface Task {
  id: string; // external id (task_external_id)
  task_id: number; // integer DB id
  name: string;
  description: string;
  difficulty: string;
  isUnlocked: boolean;
  status: string;
  verification_type?: string;
  is_verified?: boolean;
}

export interface RegenerateState {
  isOpen: boolean;
  type: 'project-overview' | 'whole-path' | 'concept' | 'subtopic' | 'task';
  itemName: string;
  description?: string;
  conceptId?: string;
  subtopicId?: string;
  taskId?: string;
} 