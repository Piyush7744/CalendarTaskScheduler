import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { CalendarOptions, CalendarApi } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import { formatDate } from '@angular/common';
import { DialogComponent } from '../dialog/dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { FullCalendarComponent } from '@fullcalendar/angular';


export interface argument {
  event: {
    title: string,
    extendedProps: {
      status: string,
      amount: number,
      id: number,
      description: string,
      type: string,
    }
  },
  view: {
    type: string
  }
}

interface tableData {
  title: string,
  date: string,
  extendedProps: {
    status: string,
    amount: number,
    id: number,
    description: string,
    type: string,
  }
}

@Component({
  selector: 'app-calendar-view',
  templateUrl: './calendar-view.component.html',
  styleUrls: ['./calendar-view.component.css']
})
export class CalendarViewComponent implements OnInit {

  @ViewChild('fullCalendar') fullCalendar: FullCalendarComponent;
  calendarApi: CalendarApi;
  view = 'dayGridMonth';
  formOpen: boolean = false;
  filter: boolean = false;
  filterValue: string = '';
  form: FormGroup;
  eventsLength: number = 0;
  listView: boolean = false;
  dataSource = new MatTableDataSource<tableData>();
  displayedColumns: string[] = ['id', 'date', 'name', 'status', 'amount', 'type', 'description'];

  calendarOptions = {
    plugins: [dayGridPlugin, interactionPlugin, listPlugin],
    initialView: 'dayGridMonth',
    views: {
      customListView: {
        type: 'list',
        duration: { days: 10 }
      }
    },
    headerToolbar: {
      left: 'prev,today,next',
      center: 'title',
      right: 'myCustomButton2 myCustomButton'
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
      if (arg.view.type == 'dayGridMonth') {
        customHtml += `<div class="event-description">${arg.event.extendedProps['amount']}</div>`;
      } else if (arg.view.type == 'dayGridWeek') {
        customHtml += `<div class="event-description">${arg.event.extendedProps['status']}</div>`;
        customHtml += `<div class="event-description">${arg.event.extendedProps['type']}</div>`;
        customHtml += `<div class="event-description">${arg.event.extendedProps['amount']}</div>`;
      } else if (arg.view.type == 'dayGridDay') {
        customHtml += `<div class="event-description">${arg.event.extendedProps['status']}</div>`;
        customHtml += `<div class="event-description">${arg.event.extendedProps['type']}</div>`;
        customHtml += `<div class="event-description">${arg.event.extendedProps['description']}</div>`;
        customHtml += `<div class="event-description">${arg.event.extendedProps['amount']}</div>`;
      } else if (arg.view.type == 'customListView') {
        customHtml = '';
        customHtml += `<table>
                        <tr>
                          <th>
                          Status
                          </th>
                          <th>
                          Type
                          </th>

                          <th>
                          Description
                          </th>
                          <th>
                          Amount
                          </th>
                      </tr>
                      <tr>
                      <td>
                        ${arg.event.title}
                      </td>
                      <td>
                      ${arg.event.extendedProps['status']}
                      </td>
                      <td>
                      ${arg.event.extendedProps['type']}
                      </td>
                      <td>
                      ${arg.event.extendedProps['description']}
                      </td>
                      <td>
                      ${arg.event.extendedProps['amount']}
                      </td>
                      </tr>
                      </table>`
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
          // here i am again updating before filtering to ensure all the data is present in events array.
          if (localStorage.getItem('calendar')) {
            const data = localStorage.getItem('calendar');
            this.calendarOptions.events = JSON.parse(data);
            this.dataSource.data = JSON.parse(data);
          }
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
    eventClick: this.handleEventClick.bind(this),
    datesSet: this.radioClick.bind(this),
  };

  constructor(public dialog: MatDialog, private fb: FormBuilder) {
    this.form = this.fb.group({
      title: ['', Validators.required],
      amount: ['', Validators.required],
      type: ['', Validators.required],
      description: ['', Validators.required],
      date: ['', Validators.required]
    })
  }

  ngOnInit(): void {
    if (localStorage.getItem('calendar')) {
      const data = localStorage.getItem('calendar');
      this.calendarOptions.events = JSON.parse(data);
      this.dataSource.data = JSON.parse(data);
    }
    const date = new Date();
    const todayDate = formatDate(date, 'yyyy-MM-dd', 'en-US');
    // here i am checking if is there any pending bill of user for today
    for (let i = 0; i < this.calendarOptions.events.length; i++) {
      if (this.calendarOptions.events[i].date == todayDate && this.calendarOptions.events[i].extendedProps.status == 'pending') {
        alert("You have an pending Bill for today");
      }
    }
  }

  changeCalendarView(viewName: string) {
    if (viewName != 'customViewList')
      this.fullCalendar.getApi().changeView(viewName);
  }

  // this function is for handling event click and it will open a dialogBox which is my
  // DialogBox Component and it is subscribing to its reference so whenever a closeDialogBox operation is
  // occured at dialogBox it will notify about that.
  handleEventClick(args: argument) {
    let dialogRef = this.dialog.open(DialogComponent, { data: args });
    // this will get triggered when user click completed button.
    dialogRef.afterClosed().subscribe((res: argument) => {
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
        localStorage.setItem('calendar', JSON.stringify(this.calendarOptions.events));
      }
    })
  }

  radioClick(args: argument) {
    if (args.view.type == "customListView") {
      this.listView = true;
    } else {
      this.listView = false;
    }
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
    if (this.form.valid) {
      console.log(this.form.value.date);

      const date = new Date(this.form.value.date);
      const date2 = formatDate(date, 'yyyy-MM-dd', 'en-US')
      // taking current events data.
      const data: any = this.calendarOptions.events;
      // adding new event of user.
      const id = this.calendarOptions.events[this.calendarOptions.events.length - 1].extendedProps.id + 1;
      data.push({ title: this.form.value.title, date: date2, extendedProps: { id: id, description: this.form.value.description, amount: this.form.value.amount, type: this.form.value.type, status: 'pending' } });
      // updating calendarOptions events array.
      this.calendarOptions.events = data;
      // closing the form.
      this.formOpen = false;
      // storing in localStorage.
      localStorage.setItem('calendar', JSON.stringify(this.calendarOptions.events));
    }
  }
  // this function is used for filtering based on user input.
  filterEvents() {
    // filtering data based on user input using filter method
    console.log("in filter method");
    console.log(this.calendarOptions.events);

    const data = this.calendarOptions.events.filter(item => {
      console.log("inside filter method");
      return item.extendedProps.type.toLowerCase().includes(this.filterValue.toLowerCase());
    })

    this.filter = false;
    // updating calendar event and only adding the filtered events.
    this.calendarOptions.events = data;
    this.dataSource.data = data;
    // based on the filtered i am calculating due amount of the events and giving alert to the user.
    let dueAmount: number = 0;

    for (let i = 0; i < this.calendarOptions.events.length; i++) {
      // adding amount in dueAmount whose status is pending.
      if (this.calendarOptions.events[i].extendedProps.status == 'pending') {
        dueAmount += this.calendarOptions.events[i].extendedProps.amount;
      }
    }

    if (this.calendarOptions.events.length == 0) {
      alert(`You don't have any category ${this.filterValue}`);
    } else {
      alert(`You have a due amount of ${dueAmount} for category ${this.filterValue}`);
    }
  }
}