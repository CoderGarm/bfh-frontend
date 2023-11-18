import {Injectable, NgZone} from '@angular/core';
import {MatSnackBar} from "@angular/material/snack-bar";
import {TranslateService} from "@ngx-translate/core";

/**
 * Plain and simple service to open a snackbar.
 */
@Injectable()
export class SnackbarNotificationService {

    constructor(public snackBar: MatSnackBar,
                private translate: TranslateService,
                private zone: NgZone) {
    }

    public short(message: string) {
        this.open(message, 'copy that', 500);
    }

    public open(message: string, action: string = 'copy that', duration: number = 5000) {
        this.zone.run(() => {
            const instant = this.translate.instant(message);
            message = instant != message ? instant : message;
            this.snackBar.open(message, action, {
                panelClass: "notification-snackbar",
                duration: duration,
                horizontalPosition: "center",
                verticalPosition: "top",
            });
        });
    }

    close() {
        this.snackBar.dismiss();
    }

    notifySave() {
        this.open('Saved', '', 150);
    }
}
