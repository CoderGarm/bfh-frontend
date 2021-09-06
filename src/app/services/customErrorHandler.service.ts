import { MatSnackBar, MatSnackBarConfig, MatSnackBarHorizontalPosition, MatSnackBarRef, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { FrontendError } from './swagger';

import { ErrorHandler, Injectable, NgZone } from '@angular/core';
import { ErrorDialogComponent } from '../components/error-dialog/error-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class CustomErrorHandler implements ErrorHandler {

  horizontalPosition: MatSnackBarHorizontalPosition = 'right';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';

  constructor(private snackBar: MatSnackBar, private zone: NgZone) { }

  handleError(receivedError: any) {

    if (!!receivedError) {
        console.log(receivedError);
      if (receivedError.error.message == null) {
        receivedError.error.message = "server not reachable - try it later or write a mail";
        receivedError.error.validationResults = [];
      }

      let errorData: FrontendError = receivedError.error;
      let snack = new MatSnackBarConfig();
      snack.data = errorData;
      snack.horizontalPosition = this.horizontalPosition;
      snack.verticalPosition = this.verticalPosition;
      snack.panelClass = "error-snackbar";
      this.zone.run(() => {
        this.snackBar.openFromComponent(ErrorDialogComponent, snack);
      });
    }

  }
}
