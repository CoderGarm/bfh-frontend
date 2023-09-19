import {AfterViewInit, Component, HostListener, Input, OnChanges, SimpleChanges} from '@angular/core';
import {Fleet, FleetApiService} from "../../../services/swagger";
import {SubscriptionManager} from "../../../subscription.manager";
import {FormControl, FormGroup} from "@angular/forms";
import {FleetEventService} from "../../../services/intercom/fleet-event.service";
import {DialogConfigHelper} from "../../../services/helper/dialog-config.helper";
import {DialogData} from "../../../components/confirmation-dialog/DialogData";
import {ConfirmDialogComponent} from "../../../components/confirmation-dialog/confirm-dialog.component";
import {MatDialog} from "@angular/material/dialog";

@Component({
    selector: 'app-fleet-display',
    templateUrl: './fleet-display.component.html',
    styleUrls: ['./fleet-display.component.scss']
})
export class FleetDisplayComponent extends SubscriptionManager implements AfterViewInit, OnChanges {

    @Input()
    fleet?: Fleet;

    formGroup: FormGroup;

    // @formatter:off
    @Input()
    get nameChangeAllowed() { return this._nameChangeAllowed; }
    set nameChangeAllowed(value: any) { this._nameChangeAllowed = this.coerceBooleanProperty(value); }
    _nameChangeAllowed: boolean = false;

    @Input()
    get retireAllowed() { return this._retireAllowed; }
    set retireAllowed(value: any) { this._retireAllowed = this.coerceBooleanProperty(value); }
    _retireAllowed: boolean = false;

    @Input()
    get transparent() { return this._transparent; }
    set transparent(value: any) { this._transparent = this.coerceBooleanProperty(value); }
    _transparent: boolean = false;
    // @formatter:on

    private coerceBooleanProperty(value: any): boolean {
        return value != null && `${value}` !== 'false';
    }

    constructor(private fleetService: FleetApiService,
                private fleetChangeService: FleetEventService,
                private dialog: MatDialog) {
        super();

        this.formGroup = new FormGroup({
            fleetName: new FormControl({value: '', disabled: true})
        });
    }

    ngAfterViewInit(): void {
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.detectName();
    }

    @HostListener('window:click', ['$event'])
    onClick(event?: UIEvent) {
        if (!!event && !!event.target) {
            const target = event.target;
            if ('classList' in target) {
                // @ts-ignore
                const classList: DOMTokenList = target.classList;
                const clickAtInput = classList.contains('name-input');
                if (!clickAtInput) {
                    this.formGroup.controls.fleetName.disable();
                }
            }
        }
    }

    private detectName() {
        if (!!this.fleet) {
            this.formGroup.controls.fleetName.setValue(this.fleet.name);
        } else {
            this.formGroup.controls.fleetName.setValue('');
        }
    }

    enable() {
        const disabled = this.formGroup.controls.fleetName.disabled;
        if (disabled) {
            this.formGroup.controls.fleetName.enable()
        }
    }

    save() {
        const name: string = this.formGroup.controls.fleetName.value;
        const disabled = this.formGroup.controls.fleetName.disabled;
        if (disabled || !this.fleet || name.length == 0) {
            return;
        }
        const sub = this.fleetService.renameFleet(this.fleet.idFleet, name)
            .subscribe(resp => {
                if (resp) {
                    this.fleetChangeService.changeName({
                        id: this.fleet!.idFleet,
                        name: name
                    });
                }
            });
        this.subscriptions.push(sub);
    }

    retireFleet() {
        if (!this.fleet) {
            return;
        }
        const sub = this.fleetService.retireFleet(this.fleet.idFleet)
            .subscribe(resp => {
                if (resp) {
                    this.fleetChangeService.retireFleet({
                        id: this.fleet!.idFleet
                    });
                }
            });
        this.subscriptions.push(sub);
    }

    openRetireFleetDialog() {
        const dialogConfig = DialogConfigHelper.createDialog();
        dialogConfig.data = new DialogData("Retire " + this.fleet?.name + '?');
        const dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.retireFleet();
            }
        })
    }
}
