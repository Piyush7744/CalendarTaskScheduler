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
import { EventData, EventService } from '../services/Event/event.service';



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
  updatedAmount: number
}

export interface amounts {
  id: number,
  eid: number,
  amount: number
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
  addEventData = {
    title: '',
    status: '',
    amount: 0,
    description: '',
    Etype: '',
    Edate: ''
  };
  dataSource = new MatTableDataSource<tableData>();
  displayedColumns: string[] = ['id', 'date', 'name', 'status', 'amount', 'type', 'description'];
  eventData: EventData[] = [];
  pastAmountArray: amounts[] = []
  emailData = {
    subject: '',
    message: ''
  }

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
      left: '',
      center: 'prev title next',
      right: 'today myCustomButton2 myCustomButton'
    },
    height: '595px',
    weekends: true,
    events: [
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
          // if (localStorage.getItem('calendar')) {
          //   const data = localStorage.getItem('calendar');
          //   this.calendarOptions.events = JSON.parse(data);
          //   this.dataSource.data = JSON.parse(data);
          // }
          this.getData();
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

  constructor(public dialog: MatDialog, private fb: FormBuilder, private service: EventService) {
    this.form = this.fb.group({
      title: ['', Validators.required],
      amount: ['', Validators.required],
      type: ['', Validators.required],
      description: ['', Validators.required],
      date: ['', Validators.required]
    })

    if (localStorage.getItem('token')) {
      // const data = localStorage.getItem('calendar');
      // this.calendarOptions.events = JSON.parse(data);
      // this.dataSource.data = JSON.parse(data);
      this.getData();
    }
  }

  ngOnInit(): void {
    const date = new Date();
    const todayDate = formatDate(date, 'yyyy-MM-dd', 'en-US');
    // here i am checking if is there any pending bill of user for today
    for (let i = 0; i < this.calendarOptions.events.length; i++) {
      if (this.calendarOptions.events[i].date == todayDate && this.calendarOptions.events[i].extendedProps.status == 'pending') {
        alert("You have an pending Bill for today");
      }
    }
  }

  getData() {
    this.service.getEvent().subscribe((data: EventData[]) => {
      this.eventData = data;
      const newData = [];
      for (let i = 0; i < this.eventData.length; i++) {
        const date = new Date(this.eventData[i].Edate);
        const date2 = formatDate(date, 'yyyy-MM-dd', 'en-US');
        const event = {
          title: this.eventData[i].title,
          date: date2.toString(),
          extendedProps: {
            id: this.eventData[i].id,
            status: this.eventData[i].status,
            amount: this.eventData[i].amount,
            type: this.eventData[i].Etype,
            description: this.eventData[i].description
          }
        }
        newData.push(event);
      }
      this.calendarOptions.events = newData;
    })
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
        this.pastAmountArray = [];
        const event = {
          eid: res.event.extendedProps.id,
          amount: res.updatedAmount
        }
        this.service.updateAmount(event).subscribe({
          next: () => {
            console.log("Updated amount successfully");
            this.service.pastAmount(res.event.extendedProps.id).subscribe((data: amounts[]) => {
              this.pastAmountArray = data;
              let total = 0;
              for (let i = 0; i < this.pastAmountArray.length; i++) {
                total += this.pastAmountArray[i].amount;
              }
              console.log(total >= res.event.extendedProps.amount);

              if (total == res.event.extendedProps.amount) {
                this.service.updateStatus(res.event.extendedProps.id).subscribe({
                  next: () => {
                    this.getData();
                    this.emailData.subject = 'Event completed'
                    this.emailData.message = `You have completed your event of category ${res.event.extendedProps.type} named as ${res.event.title} of rupees ${res.event.extendedProps.amount}`
                    this.service.emailMessage(this.emailData).subscribe({
                      next: () => {
                        console.log("Email sent Successfully");

                      }
                    })
                    // localStorage.setItem('calendar', JSON.stringify(this.calendarOptions.events));
                  }
                })
              }
            })
          }
        })

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
      const data = this.form.value;
      const date = new Date(data.date);
      const date2 = formatDate(date, 'yyyy-MM-dd', 'en-US');
      console.log(this.form.value);

      this.addEventData.title = data.title;
      this.addEventData.Edate = date2;
      this.addEventData.description = data.description;
      this.addEventData.status = "pending";
      this.addEventData.amount = data.amount;
      this.addEventData.Etype = data.type;
      this.service.addEvent(this.addEventData).subscribe({
        next: (res) => {
          console.log("Successfully added event");
          this.getData();
          this.emailData.subject = `New event ${data.title}`
          this.emailData.message = `<html><body>
          <h3>Here is your Event detials:</h3>
                                      <table border='1'>
                                      <tr>
                                        <th>Event Name</th>
                                        <th>Event Amount</th>
                                        <th>Event Date</th>
                                      </tr>
                                      <tr>
                                        <td>${data.title}</td>
                                        <td>${data.amount}</td>
                                        <td> ${date2}</td>
                                      </tr>
                                      </table>            
                                    </body></html>`
          this.service.emailMessage(this.emailData).subscribe({
            next: () => {
              console.log("Email sent");

            }
          })
        }
      }
      )
      this.formOpen = false;
      // localStorage.setItem('calendar', JSON.stringify(this.calendarOptions.events));
    }
  }
  // this function is used for filtering based on user input.
  filterEvents() {
    const data = this.calendarOptions.events.filter(item => {
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