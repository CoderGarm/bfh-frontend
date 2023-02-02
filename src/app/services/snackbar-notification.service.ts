import {Injectable, NgZone} from '@angular/core';
import {MatSnackBar} from "@angular/material/snack-bar";

/**
 * Plain and simple service to open a snackbar.
 */
@Injectable()
export class SnackbarNotificationService {

    constructor(public snackBar: MatSnackBar, private zone: NgZone) {
    }

    public open(message: string, action: string = 'copy that', duration: number = 5000) {
        this.zone.run(() => {
            this.snackBar.open(message, action, {
                panelClass: "notification-snackbar",
                duration: duration,
                horizontalPosition: "center",
                verticalPosition: "top",
            });
        });
    }
}
