import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.css']
})
export class DialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public eventData: any, private dialogRef: MatDialogRef<DialogComponent>) { }
  // this function will close the dialogBox.
  closeDialog() {
    this.dialogRef.close();
  }
  // if user click complete button this function gets trigger.
  completed() {
    // sending the current event back to the calendar Component and will change it's status to completed.
    this.dialogRef.close(this.eventData);
  }
}
