export class ConstructionLog {
  id: string;
  date: Date;
  project_id: string;
  tasks: string;
  comments: string;
  created_at: Date;
  updated_at: Date;
  constructor(
    id: string,
    date: Date,
    project_id: string,
    tasks: string,
    comments: string,
    created_at: Date,
    updated_at: Date
  ) {
    this.id = id;
    this.date = date;
    this.project_id = project_id;
    this.tasks = tasks;
    this.comments = comments;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }

}
