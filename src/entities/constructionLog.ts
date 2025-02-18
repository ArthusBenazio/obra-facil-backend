import { attachment_type, Climate, Condition, Period } from "@prisma/client";

export class ConstructionLog {
  id: string;
  date: Date;
  project_id: string;
  tasks: string;
  comments?: string | null;
  created_at: Date;
  updated_at: Date;
  weathers: { period: Period; climate: Climate; condition: Condition }[];
  occurrences?: { type: string; description: string; employee_id?: string | null }[];
  services?: { name: string; description: string; value: number }[];
  attachments?: { url: string; type: attachment_type }[];
  employees: { hours_worked: number; employee_id: string }[];
  equipment_usage?: { equipment_id: string; quantity: number }[];

  constructor(
    id: string,
    date: Date,
    project_id: string,
    tasks: string,
    comments?: string,
    created_at?: Date,
    updated_at?: Date,
    weathers: { period: Period; climate: Climate; condition: Condition }[] = [],
    occurrences?: { type: string; description: string; employee_id?: string }[],
    services?: { name: string; description: string; value: number }[],
    attachments?: { url: string; type: attachment_type }[],
    employees: { hours_worked: number; employee_id: string }[] = [],
    equipment_usage?: { equipment_id: string; quantity: number }[]
  ) {
    this.id = id;
    this.date = date;
    this.project_id = project_id;
    this.tasks = tasks;
    this.comments = comments;
    this.created_at = created_at || new Date();
    this.updated_at = updated_at || new Date();
    this.weathers = weathers;
    this.occurrences = occurrences;
    this.services = services;
    this.attachments = attachments;
    this.employees = employees;
    this.equipment_usage = equipment_usage;
  }
}