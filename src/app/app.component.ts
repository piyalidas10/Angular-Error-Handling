import { Component } from '@angular/core';
import { ApiService } from './api.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Error-handling';

  constructor(private apiService: ApiService) {
    this.apiService.getUsers().subscribe(
      (res) => {
        console.log('res => ', res);
      },
      (error) => {
        //Throwing error to global error handler
        throw error;
      }
    );
  }

}
