import { Component } from '@angular/core';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

@Component({
  selector: 'app-calendar-view',
  templateUrl: './calendar-view.component.html',
  styleUrls: ['./calendar-view.component.css']
})
export class CalendarViewComponent {
  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    weekends: true,
    events: [
      { title: 'Event 1', date: '2025-08-10' },
      { title: 'Event 2', start: '2025-08-12T10:00:00', end: '2025-08-12T12:00:00' },
      { title: "Piyush Malviya", date: '2025-08-11' }
    ],
    dateClick: this.handleDateClick.bind(this) // Example of handling clicks
  };

  handleDateClick(arg: any) {
    alert('date click! ' + arg.dateStr);
  }
}
