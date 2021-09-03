import { ValidationResult } from './../../../../swagger/swaggerGenerated/model/validationResult';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';
import { FrontendError } from './../../services/swagger/model/frontendError';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import {Observable, of, ReplaySubject} from 'rxjs'
import { DataSource } from '@angular/cdk/collections';

@Component({
  selector: 'app-error-dialog',
  templateUrl: './error-dialog.component.html',
  styleUrls: ['./error-dialog.component.scss']
})
export class ErrorDialogComponent implements OnInit {

  public errorData: FrontendError = {};

  displayedColumns: string[] = ['property', 'message'];
  dataSource = new ValidationResultDataSource([]);

  constructor(private snackBarRef: MatSnackBarRef<ErrorDialogComponent>, @Inject(MAT_SNACK_BAR_DATA) private data: any) {  
    this.errorData = data;
    if (!!this.errorData.validationResults) {
      this.dataSource.setData(this.errorData.validationResults);
    }
   }

  ngOnInit() { }

  close() {
    this.snackBarRef.dismiss();
  }

}

class ValidationResultDataSource extends DataSource<ValidationResult> {
  private _dataStream = new ReplaySubject<ValidationResult[]>();

  constructor(initialData: ValidationResult[]) {
    super();
    this.setData(initialData);
  }

  connect(): Observable<ValidationResult[]> {
    return this._dataStream;
  }

  disconnect() {}

  setData(data: ValidationResult[]) {
    this._dataStream.next(data);
  }
}