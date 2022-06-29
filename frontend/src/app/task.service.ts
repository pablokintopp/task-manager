import { Injectable } from '@angular/core';
import { List } from './models/list.model';
import { Task } from './models/task.model';
import { WebRequestService } from './web-request.service';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  constructor(private webRequestService: WebRequestService) {
  }


  getAllLists() {
    return this.webRequestService.get<List[]>('lists');
  }

  createNewList(title: string) {
    return this.webRequestService.post<List>('lists', { title: title })
  }

  getAllTasksFromList(listId: string) {
    return this.webRequestService.get<Task[]>(`lists/${listId}/tasks`);
  }

  createNewTask(listId: string, title: string) {
    return this.webRequestService.post<Task>(`lists/${listId}/tasks`, { title: title });
  }


}
