import { Component, OnInit } from '@angular/core';
import { TaskService } from 'src/app/task.service';

@Component({
  selector: 'app-new-list',
  templateUrl: './new-list.component.html',
  styleUrls: ['./new-list.component.scss']
})
export class NewListComponent implements OnInit {

  constructor(private taskService: TaskService) { }

  ngOnInit(): void {
  }

  createNewList(title: string) {
    if (title !== null && title.trim() !== '') {
      this.taskService.createNewList(title).subscribe((result) => {
        console.log(result);
      })
    }
  }

}
