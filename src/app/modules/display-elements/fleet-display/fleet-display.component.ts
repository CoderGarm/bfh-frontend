import {AfterViewInit, Component, HostListener, Input, OnChanges, SimpleChanges} from '@angular/core';
import {Fleet, FleetApiService} from "../../../services/swagger";
import {SubscriptionManager} from "../../../SubscriptionManager";
import {FormControl, FormGroup} from "@angular/forms";
import {FleetChangeService} from "../../../services/fleet-change.service";

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
    fleetInput?: Fleet;

    isOpen: boolean = false;

    formGroup: FormGroup;

    @Input()
    nameChangeAllowed: boolean = false;

    constructor(private fleetService: FleetApiService,
                private fleetChangeService: FleetChangeService) {
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
        if (!!this.fleetInput) {
            this.formGroup.controls.fleetName.setValue(this.fleetInput.name);
        } else {
            this.formGroup.controls.fleetName.setValue('');
        }
    }

    /**
     * constructs and returns the url to the icon
     */
    getLink(): string {
        //todo amend fleet size icon
        return "assets/icons/fleets/png64x/small_fleet_c.png";
    }

    setOpened() {
        this.isOpen = true;
    }

    setClosed() {
        this.isOpen = false;
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
        if (disabled || !this.fleetInput || name.length == 0) {
            return;
        }
        const sub = this.fleetService.renameFleet(this.fleetInput.idFleet, name)
            .subscribe(resp => {
                if (resp) {
                    this.fleetChangeService.nameChange.emit({
                        idFleet: this.fleetInput!.idFleet,
                        name: name
                    })
                }
            });
        this.subscriptions.push(sub);
    }
}
