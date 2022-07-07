import { AuthService } from './auth.service';
import { Injectable } from '@angular/core';
import { List } from './models/list.model';
import { Task } from './models/task.model';
import { WebRequestService } from './web-request.service';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  constructor(
    private webRequestService: WebRequestService,
    private authService: AuthService
  ) {}

  getAllLists() {
    return this.webRequestService.get<List[]>('lists');
  }

  createNewList(title: string) {
    return this.webRequestService.post<List>('lists', { title: title });
  }

  getAllTasksFromList(listId: string) {
    return this.webRequestService.get<Task[]>(`lists/${listId}/tasks`);
  }

  createNewTask(listId: string, title: string) {
    return this.webRequestService.post<Task>(`lists/${listId}/tasks`, {
      title: title,
    });
  }

  toggleTaskCompletedFlag(task: Task) {
    return this.webRequestService.patch(
      `lists/${task._listId}/tasks/${task._id}`,
      { completed: task.completed }
    );
  }

  getUserEmail() {
    return this.authService.getUserEmail() as string;
  }

  signOut() {
    this.authService.logout();
  }

  deleteList(listId: string) {
    return this.webRequestService.delete<List>(`lists/${listId}`);
  }
}
