import {MatDialogConfig} from "@angular/material/dialog";

export class DialogConfigHelper {

    static createDialog(): MatDialogConfig {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;
        dialogConfig.panelClass = ['confirm-mat-dialog-panel', 'mat-elevation-z8'];
        return dialogConfig;
    }
}