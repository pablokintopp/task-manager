import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { List } from 'src/app/models/list.model';
import { Task } from 'src/app/models/task.model';
import { TaskService } from 'src/app/task.service';

@Component({
  selector: 'app-task-view',
  templateUrl: './task-view.component.html',
  styleUrls: ['./task-view.component.scss']
})
export class TaskViewComponent implements OnInit {

  lists: List[] = [];
  tasks: Task[] = [];
  listIdSelected: string = '';

  constructor(private taskService: TaskService, private route: ActivatedRoute) { }

  ngOnInit(): void {

    this.taskService.getAllLists().subscribe((listsResponse) => {
      this.lists = listsResponse;
    });

    this.route.params.subscribe((params) => {
      if (params['listId']) {
        this.listIdSelected = params['listId'];
        this.taskService.getAllTasksFromList(params['listId']).subscribe((tasks) => {
          this.tasks = tasks
        })
      }

    })
  }

  onTaskClick(task: Task){
    task.completed = !task.completed;
    this.taskService.toggleTaskCompletedFlag(task).subscribe(() => console.log("Success!"));
  }



}
