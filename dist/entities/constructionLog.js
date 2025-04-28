export class ConstructionLog {
    constructor(id, date, project_id, tasks, comments, created_at, updated_at, weathers = [], occurrences, services, attachments, employees = [], equipment_usage) {
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
