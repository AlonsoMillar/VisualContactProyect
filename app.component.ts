import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { DatabaseService } from './service/database.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  constructor(
    private dbService: DatabaseService,
    private router: Router
  ) {
    this.inicializarApp();
  }

  async inicializarApp() {
    // Inicializa la base de datos
    await this.dbService.initDB();

    // Cargar el usuario activo desde SQLite / localStorage
    await this.dbService.loadActiveUser();

    // Revisar si hay usuario cargado
    const usuario = this.dbService.currentUser$.value;

    if (usuario) {
      //  Usuario logueado → ir directamente al home
      this.router.navigateByUrl('/home', { replaceUrl: true });
    } else {
      //  Sin sesión → ir al login
      this.router.navigateByUrl('/login', { replaceUrl: true });
    }
  }
}
