import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TaskService } from 'src/app/task.service';

@Component({
  selector: 'app-task-view',
  templateUrl: './task-view.component.html',
  styleUrls: ['./task-view.component.scss']
})
export class TaskViewComponent implements OnInit {

  lists: any = [];
  tasks: any = [];

  constructor(private taskService: TaskService, private route: ActivatedRoute) { }

  ngOnInit(): void {

    this.taskService.getAllLists().subscribe((listsResponse) => {
      this.lists = listsResponse;
    });

    this.route.params.subscribe((params) => {
      if (params['listId']) {
        this.taskService.getAllTasksFromList(params['listId']).subscribe((tasks) => {
          this.tasks = tasks
        })
      }

    })
  }




}
