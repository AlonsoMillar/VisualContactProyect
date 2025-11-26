import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PhoneInfoService {

  private apiKey = '5AMOMBHC22lZFyHOEpUPIy2F7SA6Mzu0';
  private baseUrl = 'https://api.apilayer.com/number_verification/validate';

  constructor(private http: HttpClient) {}

  getPhoneInfo(number: string): Observable<any> {
    const headers = new HttpHeaders({
      apikey: this.apiKey
    });

    return this.http.get<any>(`${this.baseUrl}?number=${number}`, { headers });
  }
}
