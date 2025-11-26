import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  // =========================
  // Página de inicio lógica (Startup)
  // =========================
  {
    path: '',
    redirectTo: 'startup',
    pathMatch: 'full'
  },

  {
    path: 'startup',
    loadChildren: () => import('./pages/startup/startup.module').then(m => m.StartupPageModule)
  },

  // =========================
  // Rutas principales
  // =========================
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then(m => m.LoginPageModule)
  },
  {
    path: 'register',
    loadChildren: () => import('./pages/register/register.module').then(m => m.RegisterPageModule)
  },
  {
    path: 'home',
    loadChildren: () => import('./pages/home/home.module').then(m => m.HomePageModule)
  },
  {
    path: 'info',
    loadChildren: () => import('./pages/info/info.module').then(m => m.InfoPageModule)
  },
  {
    path: 'recientes',
    loadChildren: () => import('./pages/recientes/recientes.module').then(m => m.RecientesPageModule)
  },
  {
    path: 'teclado',
    loadChildren: () => import('./pages/teclado/teclado.module').then(m => m.TecladoPageModule)
  },
  {
    path: 'config',
    loadChildren: () => import('./pages/config/config.module').then(m => m.ConfigPageModule)
  },
  {
    path: 'error404',
    loadChildren: () => import('./pages/error404/error404.module').then(m => m.Error404PageModule)
  },

  // =========================
  // Ruta comodín (404)
  // =========================
  {
    path: '**',
    redirectTo: 'error404',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
