import { Component, DoCheck, OnInit } from '@angular/core';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { formatDate } from '@angular/common';
import { DialogComponent } from '../dialog/dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-calendar-view',
  templateUrl: './calendar-view.component.html',
  styleUrls: ['./calendar-view.component.css']
})
export class CalendarViewComponent implements OnInit {
  formOpen: boolean = false;
  form = {
    title: '',
    date: '',
    type: '',
    amount: 0,
    description: ''
  }
  calendarOptions: CalendarOptions;
  constructor(public dialog: MatDialog) {
    this.calendarOptions = {
      plugins: [dayGridPlugin, interactionPlugin],
      initialView: 'dayGridMonth',
      headerToolbar: {
        left: 'prev,today,next',
        center: 'title',
        right: 'dayGridMonth,dayGridWeek,dayGridDay myCustomButton'
      },
      height: '595px',
      weekends: true,
      events: [
        {
          title: 'Event 1', date: '2025-08-10', extendedProps: { description: 'Discuss project progress', amount: 2000, status: 'pending' }
        },
        {
          title: 'Event 2', date: '2025-08-11', extendedProps: { description: 'Discuss project progress', amount: 2000, status: 'completed' }
        },
        {
          title: 'Event 1', date: '2025-08-12', extendedProps: { description: 'Discuss project progress', amount: 2000, status: 'pending' }
        },

      ],
      // In event i am showing amount as well with title initially it was only title
      eventContent: (arg) => {
        let customHtml = `<div>${arg.event.title}</div>`;
        if (arg.event.extendedProps['description']) {
          customHtml += `<div class="event-description">${arg.event.extendedProps['amount']}</div>`;
        }
        return { html: customHtml };
      },
      // adding my custom button in header.
      customButtons: {
        myCustomButton: {
          text: 'Add Event',
          click: () => {
            this.formOpen = true
          }
        }
      },
      // this is for applying event color based on status of event.
      eventDidMount: (info) => {
        if (info.event.extendedProps['status'] === 'pending') {
          info.el.style.backgroundColor = 'red';
        } else if (info.event.extendedProps['status'] === 'completed') {
          info.el.style.backgroundColor = 'green';
        }
      },
      eventClick: this.handleEventClick.bind(this)
    };

  }

  ngOnInit(): void {

    if (localStorage.getItem('calendar')) {
      const data = localStorage.getItem('calendar');
      console.log(JSON.parse(data));

      this.calendarOptions.events = JSON.parse(data).events;
    }

  }
  // this function is for handling event click and it will open a dialogBox which is my
  // DialogBox Component and it is subscribing to its reference so whenever a closeDialogBox operation is
  // occured at dialogBox it will notify about that.
  handleEventClick(args: any) {
    console.log(args.event);
    let dialogRef = this.dialog.open(DialogComponent, { data: args });
    dialogRef.afterClosed().subscribe(res => {
      console.log("Dialog box closed");
    })
  }

  // this is to close addEvent form if user want to dont add any event.

  closeForm() {
    this.formOpen = false;
  }

  // this function is used for updating calendarOptions events array if user adds a new event then it will 
  // update the calendarOptions and here i am storing calendarOptions in my localStorage so if user by mistakely
  // refreshes the page then also his/her event will remain unChanged.
  submitForm() {


    const date = new Date(this.form.date);
    const date2 = formatDate(date, 'yyyy-MM-dd', 'en-US')
    // taking current events data.
    const data: any = this.calendarOptions.events;
    // adding new event of user.
    data.push({ title: this.form.title, date: date2, extendedProps: { description: this.form.description, amount: this.form.amount, type: this.form.type, status: 'pending' } });
    // updating calendarOptions events array.
    this.calendarOptions.events = data;
    // storing in localStorage.
    localStorage.setItem('calendar', JSON.stringify(this.calendarOptions));
    // closing the form.
    this.formOpen = false;
  }

}
