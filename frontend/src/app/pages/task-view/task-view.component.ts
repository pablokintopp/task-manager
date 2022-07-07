import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { List } from 'src/app/models/list.model';
import { Task } from 'src/app/models/task.model';
import { TaskService } from 'src/app/task.service';

@Component({
  selector: 'app-task-view',
  templateUrl: './task-view.component.html',
  styleUrls: ['./task-view.component.scss'],
})
export class TaskViewComponent implements OnInit {
  lists: List[] = [];
  tasks: Task[] = [];
  listIdSelected: string = '';
  listSelected: any;
  userEmail: string = '';
  isAddingNewList: boolean = false;

  constructor(
    private taskService: TaskService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.taskService.getAllLists().subscribe((listsResponse) => {
      this.lists = listsResponse;

      this.route.params.subscribe((params) => {
        if (params['listId']) {
          this.updateListSelectedList(params['listId']);
          this.taskService
            .getAllTasksFromList(params['listId'])
            .subscribe((tasks) => {
              this.tasks = tasks;
            });
        }
      });
    });

    this.userEmail = this.taskService.getUserEmail();
  }

  onTaskClick(task: Task) {
    task.completed = !task.completed;
    this.taskService
      .toggleTaskCompletedFlag(task)
      .subscribe(() => console.log('Success!'));
  }

  onSignOutButtonClick() {
    this.taskService.signOut();
  }

  onAddNewListClick() {
    this.isAddingNewList = true;
  }

  onBlurNewListItem(newListTitle: string) {
    this.onAddNewList(newListTitle);
  }

  onAddNewList(newListTitle: string) {
    if (newListTitle != null && newListTitle.trim() != '') {
      this.taskService.createNewList(newListTitle).subscribe((newList) => {
        this.lists.push(newList);
        this.updateListSelectedList(newList._id);
        this.router.navigate(['/lists', newList._id]);
      });
    }

    this.isAddingNewList = false;
  }

  updateListSelectedList(newId: string) {
    this.listIdSelected = newId;
    if (this.listIdSelected) {
      this.listSelected = this.lists.find(
        (list) => list._id === this.listIdSelected
      );
    }
  }

  onDeleteListClickButton() {
    if (this.listIdSelected) {
      this.taskService
        .deleteList(this.listIdSelected)
        .subscribe((listDeleted) => {
          this.listIdSelected = '';
          this.listSelected = undefined;
          this.router.navigateByUrl('/lists');
        });
    }
  }
}
