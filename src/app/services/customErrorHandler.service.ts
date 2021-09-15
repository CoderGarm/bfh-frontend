import {
  MatSnackBar,
  MatSnackBarConfig,
  MatSnackBarHorizontalPosition,
  MatSnackBarRef,
  MatSnackBarVerticalPosition
} from '@angular/material/snack-bar';
import {FrontendError, JWTRes} from './swagger';

import {ErrorHandler, Injectable, NgZone} from '@angular/core';
import {ErrorDialogComponent} from '../components/error-dialog/error-dialog.component';
import {TokenStorage} from "./authentication/token-storage.service";
import RoleEnum = JWTRes.RoleEnum;
import {Router} from "@angular/router";
import {ProfileComponent} from "../components/user/profile/profile.component";

@Injectable({
  providedIn: 'root'
})
export class CustomErrorHandler implements ErrorHandler {

  horizontalPosition: MatSnackBarHorizontalPosition = 'right';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';

  constructor(private snackBar: MatSnackBar,
              private zone: NgZone,
              private tokenStorage: TokenStorage,
              private router: Router) {
  }

  handleError(receivedError: any) {

    if (!!receivedError) {
      let snack = new MatSnackBarConfig();

      if (receivedError instanceof Error) {
        let error: Error = receivedError;
        const feError: FrontendError = {
          message: error.message,
          validationResults: [{property: error.name}]
        }
        console.log(error);
        snack.data = feError;
      } else {
        if (receivedError.error.message == null) {
          receivedError.error.message = "server not reachable - try it later or write a mail";
          receivedError.error.validationResults = [];
        }

        if (receivedError.error.code == 403) {
          /* todo: commented out while the server cannot respond with 401
          this.tokenStorage.getRole().subscribe(role => {
             this.navigateToLandingPage(role);
           });
           */
          return;
        }

        let errorData: FrontendError = receivedError.error;
        snack.data = errorData;
      }
      snack.horizontalPosition = this.horizontalPosition;
      snack.verticalPosition = this.verticalPosition;
      snack.panelClass = "error-snackbar";
      this.zone.run(() => {
        this.snackBar.openFromComponent(ErrorDialogComponent, snack);
      });
    }
  }

  navigateToLandingPage(role: string) {
    switch (role) {
      case RoleEnum.USER:
        this.router.navigateByUrl(ProfileComponent.path);
        break;
      default:
        break;
    }
  }
}
