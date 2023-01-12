import {Injectable, NgZone} from '@angular/core';
import {MatSnackBar} from "@angular/material/snack-bar";

/**
 * Plain and simple service to open a snackbar.
 */
@Injectable()
export class SnackbarNotificationService {

    constructor(public snackBar: MatSnackBar, private zone: NgZone) {
    }

    public open(message: string, action = 'copy that') {
        this.zone.run(() => {
            this.snackBar.open(message, action, {
                panelClass: "notification-snackbar",
                duration: 5000,
                horizontalPosition: "center",
                verticalPosition: "top",
            });
        });
    }
}
