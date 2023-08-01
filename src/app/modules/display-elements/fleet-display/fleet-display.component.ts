import {AfterViewInit, Component, HostListener, Input, OnChanges, SimpleChanges} from '@angular/core';
import {Fleet, FleetApiService} from "../../../services/swagger";
import {SubscriptionManager} from "../../../subscription.manager";
import {UntypedFormControl, UntypedFormGroup} from "@angular/forms";
import {FleetEventService} from "../../../services/intercom/fleet-event.service";

export interface FleetName {
    idFleet: number;
    name: string;
}

@Component({
    selector: 'app-fleet-display',
    templateUrl: './fleet-display.component.html',
    styleUrls: ['./fleet-display.component.scss']
})
export class FleetDisplayComponent extends SubscriptionManager implements AfterViewInit, OnChanges {

    @Input()
    fleet?: Fleet;

    formGroup: UntypedFormGroup;

    // @formatter:off
    @Input()
    get nameChangeAllowed() { return this._nameChangeAllowed; }
    set nameChangeAllowed(value: any) { this._nameChangeAllowed = this.coerceBooleanProperty(value); }
    _nameChangeAllowed: boolean = false;

    @Input()
    get transparent() { return this._transparent; }
    set transparent(value: any) { this._transparent = this.coerceBooleanProperty(value); }
    _transparent: boolean = false;
    // @formatter:on

    private coerceBooleanProperty(value: any): boolean {
        return value != null && `${value}` !== 'false';
    }

    constructor(private fleetService: FleetApiService,
                private fleetChangeService: FleetEventService) {
        super();

        this.formGroup = new UntypedFormGroup({
            fleetName: new UntypedFormControl({value: '', disabled: true})
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
                        idFleet: this.fleet!.idFleet,
                        name: name
                    })
                }
            });
        this.subscriptions.push(sub);
    }
}
