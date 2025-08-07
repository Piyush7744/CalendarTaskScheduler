import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.css']
})
export class DialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public eventData: any, private dialogRef: MatDialogRef<DialogComponent>) { }
  closeDialog() {
    this.dialogRef.close();
  }
  completed(){
    console.log(this.eventData);
    
  }
}
