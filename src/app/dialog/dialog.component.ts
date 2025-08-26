import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { amounts, argument } from '../calendar-view/calendar-view.component';
import { EventService } from '../services/Event/event.service';
@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.css']
})
export class DialogComponent {
  amount = 0;
  amountArray: amounts[] = []
  remaining = 0;

  constructor(@Inject(MAT_DIALOG_DATA) public eventData: argument, private dialogRef: MatDialogRef<DialogComponent>, private service: EventService) {
    this.amount = eventData.event.extendedProps.amount;
    this.remaining = this.amount;
    this.service.pastAmount(eventData.event.extendedProps.id).subscribe((data: amounts[]) => {
      this.amountArray = data;

      if (this.amountArray.length >= 1) {
        for (let i = 0; i < this.amountArray.length; i++) {
          this.remaining -= this.amountArray[i].amount;
        }
      }
    })




  }
  // this function will close the dialogBox.
  closeDialog() {
    this.dialogRef.close();
  }
  // if user click complete button this function gets trigger.
  completed() {
    // sending the current event back to the calendar Component and will change it's status to completed.
    if (this.amount > this.remaining) {
      alert("Can't add extra money");
    } else {
      this.eventData.updatedAmount = this.amount;
      this.dialogRef.close(this.eventData);
    }
  }
}
