import {AfterViewInit, Component, HostListener, Inject, Injector, StaticProvider} from '@angular/core';
import {MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef as MatDialogRef} from "@angular/material/legacy-dialog";
import {DialogData} from "./DialogData";
import {Template} from "@angular/compiler/src/render3/r3_ast";

@Component({
    selector: 'app-confirm-dialog',
    templateUrl: './confirm-dialog.component.html',
    styleUrls: ['./confirm-dialog.component.scss']
})
export class ConfirmDialogComponent implements AfterViewInit {

    injectors: Map<Template, Injector> = new Map<Template, Injector>();

    constructor(private dialogRef: MatDialogRef<ConfirmDialogComponent>,
                public inj: Injector,
                @Inject(MAT_DIALOG_DATA) public data: DialogData) {
        data.dataPerTemplate.map(value => {

            let providers: StaticProvider[] = [];
            for (let i = 0; i <= value.injectorNames.length; i++) {
                providers.push({provide: value.injectorNames[i], useValue: value.payloads[i]});
            }
            let injector = Injector.create(providers, this.inj);
            this.injectors.set(value.template, injector)
        });
    }

    public cancel() {
        this.close(false);
    }

    public close(value: boolean) {
        this.dialogRef.close(value);
    }

    public confirm() {
        this.close(true);
    }

    @HostListener("keydown.esc")
    public onEsc() {
        this.close(false);
    }

    ngAfterViewInit(): void {
    }
}
