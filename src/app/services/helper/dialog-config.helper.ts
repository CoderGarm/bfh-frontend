import {MatDialogConfig} from "@angular/material/dialog";

export class DialogConfigHelper {

    static createDialog(): MatDialogConfig {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;
        dialogConfig.panelClass = ['confirm-mat-dialog-panel', 'mat-elevation-z8'];
        return dialogConfig;
    }

    static createPlayerEmbassyDialog(): MatDialogConfig {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.disableClose = false;
        dialogConfig.autoFocus = true;
        dialogConfig.height = '85%';
        dialogConfig.width = '90%';
        dialogConfig.panelClass = ['player-embassy-mat-dialog-panel', 'mat-elevation-z8'];
        return dialogConfig;
    }
}
