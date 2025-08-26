import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private url = 'http://localhost:8000/'
  constructor(private http: HttpClient) { }

  getEvent() {
    return this.http.get<EventData[]>(`${this.url}getEvent`);
  }

  addEvent(event) {
    return this.http.post(`${this.url}uploadEvent`, event)
  }
  updateStatus(id: number) {
    console.log("Inside update status in service");

    return this.http.put(`${this.url}updateEventStatus`, { eid: id });
  }

  pastAmount(id: number) {
    return this.http.get(`${this.url}getUserAmountHistory/${id}`);
  }

  updateAmount(event) {
    return this.http.post(`${this.url}updateEventAmount`, event);
  }

  emailMessage(data) {
    return this.http.post(`${this.url}sendEmail`, data)
  }

}


export interface EventData {
  title: string,
  Edate: string,
  id: number,
  amount: number,
  description: string,
  Etype: string,
  status: string
}