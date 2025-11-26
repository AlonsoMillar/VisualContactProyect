import { Component, OnInit } from '@angular/core';
import { DatabaseService, CallLog } from '../../service/database.service';
import { PhoneInfoService } from '../../service/phone-info.service';

interface DisplayCallRecord {
  contactName: string;
  phone: string;
  time: Date;
  type: 'incoming' | 'outgoing' | 'missed' | 'message';
  icon: string;
  color: string;

  apiInfo?: {
    location?: string;
    carrier?: string;
    line_type?: string;
    country_name?: string;
    international_format?: string;
    local_format?: string;
    number?: string;
  };
}

interface CallRecordByDay {
  dateLabel: string;
  logs: DisplayCallRecord[];
}

@Component({
  selector: 'app-recientes',
  templateUrl: './recientes.page.html',
  styleUrls: ['./recientes.page.scss'],
  standalone: false
})
export class RecientesPage implements OnInit {

  allCalls: DisplayCallRecord[] = [];
  callLogByDay: CallRecordByDay[] = [];
  isLoading = true;
  searchTerm = '';

  constructor(
    private dbService: DatabaseService,
    private phoneInfoService: PhoneInfoService
  ) {}

  // =========================================================
  // INIT
  // =========================================================
  async ngOnInit() {
    await this.dbService.initDB();
    await this.loadCalls();
  }

  // =========================================================
  // LOAD CALLS + API
  // =========================================================
  async loadCalls() {
    try {
      const calls: CallLog[] = await this.dbService.getAllCallLogs();
      this.allCalls = [];

      for (const call of calls) {
        let parsedInfo: any = null;

        // 1. Si ya hay info en la BD → úsala
        if (call.info) {
          try {
            parsedInfo = JSON.parse(call.info);
          } catch {}
        }

        // 2. Si NO hay info → llamar API
        if (!parsedInfo) {
          try {
            parsedInfo = await this.phoneInfoService.getPhoneInfo(call.contact_name).toPromise();

            // Guardar en BD usando addCallLog (reinsertando con info)
            // ⚠️ No existe un UPDATE en tu servicio, así que la única forma es reinsertar.
            await this.dbService.addCallLog(call.contact_name, call.type, JSON.stringify(parsedInfo));

          } catch (err) {
            console.error("Error en API:", err);
          }
        }

        // 3. Convertir registro a visual
        this.allCalls.push(
          this.convertCallToDisplay(call, parsedInfo)
        );
      }

      this.groupCallsByDay();

    } catch (err) {
      console.error('Error cargando llamadas:', err);
    } finally {
      this.isLoading = false;
    }
  }

  // =========================================================
  // Convertir a DisplayCallRecord
  // =========================================================
  private convertCallToDisplay(call: CallLog, info: any): DisplayCallRecord {

    let icon = 'call-outline';
    let color = 'medium';

    if (call.type === 'call') {
      icon = 'call-outline';
      color = 'success';
    } else if (call.type === 'message') {
      icon = 'mail-outline';
      color = 'primary';
    }

    return {
      contactName: call.contact_name,
      phone: info?.international_format || info?.number || call.contact_name,
      time: new Date(call.timestamp),
      type: call.type === 'call' ? 'incoming' : 'message',
      icon,
      color,
      apiInfo: {
        location: info?.location,
        carrier: info?.carrier,
        line_type: info?.line_type,
        country_name: info?.country_name,
        international_format: info?.international_format,
        local_format: info?.local_format,
        number: info?.number
      }
    };
  }

  // =========================================================
  // Agrupar por día
  // =========================================================
  private groupCallsByDay() {
    const grouped: { [key: string]: DisplayCallRecord[] } = {};

    this.allCalls.forEach(call => {
      const key = call.time.toLocaleDateString();
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(call);
    });

    this.callLogByDay = Object.keys(grouped)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
      .map(date => ({
        dateLabel: date,
        logs: grouped[date]
      }));
  }

  // =========================================================
  // Acciones
  // =========================================================
  callAgain(call: DisplayCallRecord) {
    console.log('Llamando nuevamente a:', call.phone);
  }

  viewCallDetails(call: DisplayCallRecord) {
    console.log('Detalles completos:', call);
  }

  // =========================================================
  // Filtro
  // =========================================================
  filtrarCalls(): DisplayCallRecord[] {
    if (!this.searchTerm) return this.allCalls;

    const term = this.searchTerm.toLowerCase();

    return this.allCalls.filter(c =>
      (c.contactName?.toLowerCase().includes(term)) ||
      (c.phone?.includes(term)) ||
      (c.apiInfo?.carrier?.toLowerCase().includes(term)) ||
      (c.apiInfo?.location?.toLowerCase().includes(term))
    );
  }
  onScroll(event: any) {
  // Puedes usarlo si quieres detectar scroll
  // console.log("Scrolling...", event);
}

loadMore(event: any) {
  console.log("Cargando más registros...");

  // Si no cargas más, solo completa el infinite scroll
  setTimeout(() => {
    event.target.complete();
  }, 400);
}


}
