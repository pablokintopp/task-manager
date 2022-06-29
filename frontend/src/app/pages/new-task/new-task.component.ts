import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TaskService } from 'src/app/task.service';

@Component({
  selector: 'app-new-task',
  templateUrl: './new-task.component.html',
  styleUrls: ['./new-task.component.scss']
})
export class NewTaskComponent implements OnInit {

  constructor(private taskService: TaskService, private route: ActivatedRoute, private router: Router) { }

  listId: string = '';

  ngOnInit(): void {

    this.route.params.subscribe((params) => {
      this.listId = params['listId'];
    });
  }

  createNewTask(title: string) {
    if (title !== null && title.trim() !== '') {
      this.taskService.createNewTask(this.listId, title).subscribe((result) => {
        this.router.navigate(['/lists', result._listId]);
      })
    }
  }

}
