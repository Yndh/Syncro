export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean | null;
  image: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  dueTime?: Date;
  projectId: number;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  taskStatus: "TO_DO" | "ON_GOING" | "REVIEWING" | "DONE";
  assignedTo: User[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: number;
  name: string;
  description: string;
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "ON_HOLD";
  owner: User;
  ownerId: string;
  Tasks: Task[];
  members: User[];
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}
