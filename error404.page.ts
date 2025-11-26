import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-error404',
  templateUrl: './error404.page.html',
  styleUrls: ['./error404.page.scss'],
  standalone: false

})
export class Error404Page {

  constructor(private router: Router) { }

  goToConfig() {
    this.router.navigate(['/config']);
  }
}
