import { FrontendError } from './../../services/swagger/model/frontendError';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-error-dialog',
  templateUrl: './error-dialog.component.html',
  styleUrls: ['./error-dialog.component.scss']
})
export class ErrorDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<ErrorDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {
    this.errorData = new Object();
    this.errorData.message = this.data.message;
    this.errorData.validationResults = this.data.validationResults;
   }

  ngOnInit() {}

  errorData: FrontendError;

  close() {
    this.dialogRef.close(); // todo https://medium.com/angular-in-depth/expecting-the-unexpected-best-practices-for-error-handling-in-angular-21c3662ef9e4
  }

}
