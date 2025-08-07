import { Component, DoCheck, OnInit } from '@angular/core';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { formatDate } from '@angular/common';
import { DialogComponent } from '../dialog/dialog.component';
import { MatDialog } from '@angular/material/dialog';


interface formData {
  title: string,
  amount: number,
  description: string,
  type: string,
  date: string,
}

@Component({
  selector: 'app-calendar-view',
  templateUrl: './calendar-view.component.html',
  styleUrls: ['./calendar-view.component.css']
})
export class CalendarViewComponent implements OnInit {
  formOpen: boolean = false;
  filter: boolean = false;
  filterValue: string = '';
  form: formData = {
    title: '',
    date: '',
    type: '',
    amount: 0,
    description: ''
  }

  calendarOptions = {
    plugins: [dayGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,today,next',
      center: 'title',
      right: 'myCustomButton2 dayGridMonth,dayGridWeek,dayGridDay myCustomButton'
    },
    height: '595px',
    weekends: true,
    events: [
      {
        title: 'Event', date: '2025-08-10', extendedProps: { id: 1, description: 'Discuss project progress', type: 'test', amount: 2000, status: 'pending' }
      },
      {
        title: 'Event 2', date: '2025-08-11', extendedProps: { id: 2, description: 'Discuss project progress', type: 'test1', amount: 2000, status: 'completed' }
      },
      {
        title: 'Event', date: '2025-08-12', extendedProps: { id: 3, description: 'Discuss project progress', type: 'test', amount: 2000, status: 'pending' }
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
      },
      myCustomButton2: {
        text: 'Filter',
        click: () => {
          this.filter = true;
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

  constructor(public dialog: MatDialog) { }

  ngOnInit(): void {
    if (localStorage.getItem('calendar')) {
      const data = localStorage.getItem('calendar');
      this.calendarOptions.events = JSON.parse(data).events;
    }

    const date = new Date();
    const todayDate = formatDate(date, 'yyyy-MM-dd', 'en-US');
    // here i am checking if is there any pending bill of user for today
    this.calendarOptions.events.map(item => {
      if (item.date == todayDate && item.extendedProps.status == 'pending') {
        alert("You have an pending Bill for today");
      }
    })
  }

  // this function is for handling event click and it will open a dialogBox which is my
  // DialogBox Component and it is subscribing to its reference so whenever a closeDialogBox operation is
  // occured at dialogBox it will notify about that.
  handleEventClick(args: any) {
    console.log(args.event);
    let dialogRef = this.dialog.open(DialogComponent, { data: args });
    // this will get triggered when user click completed button.
    dialogRef.afterClosed().subscribe(res => {
      // storing all the events in data variable and updating the status of currentEvent that user just completed
      if (res) {
        let data = this.calendarOptions.events.filter(item => {
          if (item.extendedProps.id != res.event.extendedProps.id) {
            return item;
          } else {
            // changing status of currentEvent
            return item.extendedProps.status = 'completed';
          }
        })
        // again updating value of events and localStorage after changing status
        this.calendarOptions.events = data;
        localStorage.setItem('calendar', JSON.stringify(this.calendarOptions));
      }
    })
  }

  // this is to close addEvent form if user want to dont add any event.
  closeForm() {
    this.formOpen = false;
    this.filter = false;
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
    const id = this.calendarOptions.events[this.calendarOptions.events.length - 1].extendedProps.id + 1;
    data.push({ title: this.form.title, date: date2, extendedProps: { id: id, description: this.form.description, amount: this.form.amount, type: this.form.type, status: 'pending' } });
    // updating calendarOptions events array.
    this.calendarOptions.events = data;
    // storing in localStorage.
    localStorage.setItem('calendar', JSON.stringify(this.calendarOptions));
    // closing the form.
    this.formOpen = false;
  }
  // this function is used for filtering based on user input.
  filterEvents() {
    // filtering data based on user input using filter method
    const data = this.calendarOptions.events.filter(item => {
      return item.extendedProps.type.toLowerCase().includes(this.filterValue.toLowerCase());
    })
    this.filter = false;
    // updating calendar event and only adding the filtered events.
    this.calendarOptions.events = data;
    // based on the filtered i am calculating due amount of the events and giving alert to the user.
    let dueAmount: number = 0;
    this.calendarOptions.events.map(item => {
      if (item.extendedProps.status == 'pending') {
        // adding amount in dueAmount whose status is pending.
        dueAmount += item.extendedProps.amount;
      }
    })

    alert(`You have a due amount of ${dueAmount} for category ${this.filterValue}`);

  }
}
