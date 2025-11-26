import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Contact {
  id?: number;
  nombre: string;
  numero: string;
  destacado: boolean;
  photo: string;
  emailOwner: string;
}

@Injectable({
  providedIn: 'root'
})
export class ContactService {

  // URL de tu API
  private apiUrl = 'http://192.168.1.109:8080/api/contacts';

  constructor(private http: HttpClient) { }

  // -------------------------
  // OBTENER CONTACTOS POR EMAIL
  // -------------------------
  getContacts(emailOwner: string): Observable<Contact[]> {
    return this.http.get<Contact[]>(`${this.apiUrl}/${emailOwner}`);
  }

  // -------------------------
  // CREAR O ACTUALIZAR VARIOS CONTACTOS
  // -------------------------
  createContacts(contacts: Contact[]): Observable<Contact[]> {
    // Envía un array de contactos al endpoint que acepta List<Contact>
    return this.http.post<Contact[]>(this.apiUrl, contacts);
  }

  // -------------------------
  // ACTUALIZAR UN CONTACTO INDIVIDUAL
  // -------------------------
  updateContact(id: number, contact: Contact): Observable<Contact> {
    return this.http.put<Contact>(`${this.apiUrl}/${id}`, contact);
  }

  // -------------------------
  // ELIMINAR CONTACTO
  // -------------------------
  deleteContact(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
