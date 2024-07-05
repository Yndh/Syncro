import { DateTime } from "next-auth/providers/kakao";

export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean | null;
  image: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: number;
  name: string;
  description: string;
  status: ProjectStatus;
  tasks: Task[];
  notes: Note[];
  members: ProjectMembership[];
  projectInvitations: Invite[];
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectMembership {
  id: number;
  project: Project;
  projectId: number;
  user: User;
  userId: string;
  role: ProjectRole;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  dueTime?: Date;
  projectId: number;
  priority: TaskPriority;
  taskStatus: TaskStatus;
  assignedTo: User[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Note {
  id: number;
  title: string;
  description?: string;
  project: Project;
  projectId: number;
  createdBy: User;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Invite {
  id: number;
  linkId: string;
  maxUses?: number;
  uses: number;
  project: Project;
  projectId: number;
  expires?: DateTime;
  createdBy: User;
  createdById: string;
  createdAt: DateTime;
  updatedAt: DateTime;
}

export enum ProjectRole {
  OWNER = "OWNER",
  ADMIN = "ADMIN",
  MEMBER = "MEMBER",
}

export enum ProjectStatus {
  NOT_STARTED = "NOT_STARTED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  ON_HOLD = "ON_HOLD",
}

export enum TaskStatus {
  TO_DO = "TO_DO",
  ON_GOING = "ON_GOING",
  REVIEWING = "REVIEWING",
  DONE = "DONE",
}

export enum TaskPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  URGENT = "URGENT",
}
