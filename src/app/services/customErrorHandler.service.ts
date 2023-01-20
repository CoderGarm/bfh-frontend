import {
    MatLegacySnackBar as MatSnackBar,
    MatLegacySnackBarConfig as MatSnackBarConfig,
    MatLegacySnackBarHorizontalPosition as MatSnackBarHorizontalPosition,
    MatLegacySnackBarRef as MatSnackBarRef,
    MatLegacySnackBarVerticalPosition as MatSnackBarVerticalPosition
} from '@angular/material/legacy-snack-bar';
import {FrontendError} from './swagger';

import {ErrorHandler, Injectable, NgZone} from '@angular/core';
import {ErrorDialogComponent} from '../components/error-dialog/error-dialog.component';
import {TokenStorage} from "./authentication/token-storage.service";
import {Router} from "@angular/router";
import {ProfileComponent} from "../components/user/profile/profile.component";
import {HttpErrorResponse} from "@angular/common/http";

@Injectable({
    providedIn: 'root'
})
export class CustomErrorHandler implements ErrorHandler {

    horizontalPosition: MatSnackBarHorizontalPosition = 'right';
    verticalPosition: MatSnackBarVerticalPosition = 'bottom';

    errorDialog?: MatSnackBarRef<ErrorDialogComponent>;

    constructor(private snackBar: MatSnackBar,
                private zone: NgZone,
                private tokenStorage: TokenStorage,
                private router: Router) {
    }

    /**
     * This will open only
     * @param receivedError
     */
    handleError(receivedError: any) {
        if (!receivedError) {
            return;
        }

        if (!this.errorDialog) {
            let snack = new MatSnackBarConfig();

            const feError: FrontendError = {};
            if (receivedError instanceof HttpErrorResponse) {
                let error: HttpErrorResponse = receivedError;
                console.log(error);
                if (!!error.error && !!error.error.message) {
                    feError.message = error.error.message;
                }
                if (!!error.error && !!error.error.validationResults) {
                    feError.validationResults = error.error.validationResults;
                }

                if (receivedError.error.message == null) {
                    feError.message = "server not reachable - try it later or write a mail";
                }

                if (receivedError.error.code == 403) {
                    /* todo: commented out while the server cannot respond with 401
                    this.tokenStorage.getRole().subscribe(role => {
                       this.navigateToLandingPage(role);
                     });
                     */
                    return;
                }
            } else if (receivedError instanceof Error) {
                console.log(receivedError);
                feError.message = receivedError.message;
            }

            snack.data = feError;
            snack.horizontalPosition = this.horizontalPosition;
            snack.verticalPosition = this.verticalPosition;
            snack.panelClass = "error-snackbar";
            this.zone.run(() => {
                this.errorDialog = this.snackBar.openFromComponent(ErrorDialogComponent, snack);
                this.errorDialog.afterDismissed().subscribe(dismissed => this.errorDialog = undefined)
            });
        }
    }

    navigateToLandingPage(role: string) {
        switch (role) {
            case "ROLE_USER":
                this.router.navigateByUrl(ProfileComponent.path).then(() => {
                });
                break;
            default:
                break;
        }
    }
}
