// src/app/app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

// HTTP Client
import { HttpClientModule } from '@angular/common/http';

// Plugins
import { SQLite } from '@awesome-cordova-plugins/sqlite/ngx';
import { CallNumber } from '@awesome-cordova-plugins/call-number/ngx';
import { FingerprintAIO } from '@awesome-cordova-plugins/fingerprint-aio/ngx';

// Services
import { DatabaseService } from './service/database.service';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    HttpClientModule   // <-- agregado para poder usar HttpClient
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    SQLite,
    CallNumber,
    DatabaseService,
    FingerprintAIO
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
