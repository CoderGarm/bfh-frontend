import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {Fleet, JobApiService, Planet, PlanetApiService, ShipClass} from "../../../../../../services/swagger";
import {TranslateService} from "@ngx-translate/core";
import {SubscriptionManager} from "../../../../../../subscription.manager";
import {SnackbarNotificationService} from "../../../../../../services/snackbar-notification.service";

@Component({
    selector: 'app-fleets-at-yard',
    templateUrl: './fleets-at-yard.component.html',
    styleUrls: ['./fleets-at-yard.component.scss']
})
export class FleetsAtYardComponent extends SubscriptionManager implements OnInit, OnChanges {

    @Input()
    planet?: Planet;

    @Input()
    fleetsInOrbit?: Fleet[];
    fleetsInOrbitDef: string = 'fleetsInOrbit';

    @Input()
    possibleShipClasses: ShipClass[] = [];

    // @formatter:off
    @Input()
    get shipyardJobPossible() { return this._shipyardJobPossible; }
    set shipyardJobPossible(value: any) { this._shipyardJobPossible = this.coerceBooleanProperty(value); }
    _shipyardJobPossible: boolean = false;

    @Input()
    get shipyardExists() { return this._shipyardExists; }
    set shipyardExists(value: any) { this._shipyardExists = this.coerceBooleanProperty(value); }
    _shipyardExists: boolean = false;
    // @formatter:on

    translations: Map<string, string> = new Map<string, string>();

    private fleetsInRepair: number[] = [];

    constructor(private translate: TranslateService,
                private planetApi: PlanetApiService,
                private jobApi: JobApiService,
                private snackbar: SnackbarNotificationService) {
        super();

        this.translations.set('planetary.fleets-in-orbit.percentage-message', 'planetary.fleets-in-orbit.percentage-message');
        let sub = this.translate.get('planetary.fleets-in-orbit.percentage-message').subscribe((translated: string) => {
            this.translations.set('planetary.fleets-in-orbit.percentage-message', translated);
        });
        this.subscriptions.push(sub);

        this.translations.set('planetary.fleets-in-orbit.repair-job-started-message', 'planetary.fleets-in-orbit.repair-job-started-message');
        sub = this.translate.get('planetary.fleets-in-orbit.repair-job-started-message').subscribe((translated: string) => {
            this.translations.set('planetary.fleets-in-orbit.repair-job-started-message', translated);
        });
        this.subscriptions.push(sub);

        this.translations.set('planetary.fleets-in-orbit.repair-btn.start-job', 'planetary.fleets-in-orbit.repair-btn.start-job');
        sub = this.translate.get('planetary.fleets-in-orbit.repair-btn.start-job').subscribe((translated: string) => {
            this.translations.set('planetary.fleets-in-orbit.repair-btn.start-job', translated);
        });
        this.subscriptions.push(sub);

        this.translations.set('planetary.fleets-in-orbit.repair-btn.no-shipyard', 'planetary.fleets-in-orbit.repair-btn.no-shipyard');
        sub = this.translate.get('planetary.fleets-in-orbit.repair-btn.no-shipyard').subscribe((translated: string) => {
            this.translations.set('planetary.fleets-in-orbit.repair-btn.no-shipyard', translated);
        });
        this.subscriptions.push(sub);

        this.translations.set('planetary.fleets-in-orbit.repair-btn.no-repair-needed', 'planetary.fleets-in-orbit.repair-btn.no-repair-needed');
        sub = this.translate.get('planetary.fleets-in-orbit.repair-btn.no-repair-needed').subscribe((translated: string) => {
            this.translations.set('planetary.fleets-in-orbit.repair-btn.no-repair-needed', translated);
        });
        this.subscriptions.push(sub);

        this.translations.set('planetary.fleets-in-orbit.repair-btn.already-in-use', 'planetary.fleets-in-orbit.repair-btn.already-in-use');
        sub = this.translate.get('planetary.fleets-in-orbit.repair-btn.already-in-use').subscribe((translated: string) => {
            this.translations.set('planetary.fleets-in-orbit.repair-btn.already-in-use', translated);
        });
        this.subscriptions.push(sub);

        this.translations.set('planetary.fleets-in-orbit.repair-btn.is-in-repair', 'planetary.fleets-in-orbit.repair-btn.is-in-repair');
        sub = this.translate.get('planetary.fleets-in-orbit.repair-btn.is-in-repair').subscribe((translated: string) => {
            this.translations.set('planetary.fleets-in-orbit.repair-btn.is-in-repair', translated);
        });
        this.subscriptions.push(sub);
    }

    private coerceBooleanProperty(value: any): boolean {
        return value != null && `${value}` !== 'false';
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes[this.fleetsInOrbitDef]) {
            this.fleetsInRepair = [];
            this.fleetsInOrbit?.forEach(fleet => {
                let sub = this.jobApi.jobRunningForFleet(fleet.idFleet).subscribe(resp => {
                    if (resp) {
                        this.fleetsInRepair.push(fleet.idFleet);
                    } else {
                        const index = this.fleetsInRepair.indexOf(fleet.idFleet);
                        if (index != -1) {
                            this.fleetsInRepair.splice(index, 1);
                        }
                    }
                });
                this.subscriptions.push(sub);
            });
        }
    }

    ngOnInit(): void {
    }

    repairPossible(fleet: Fleet) {
        if (this.isInRepair(fleet)) {
            return false;
        }
        return fleet.state.needsRepair && this.shipyardJobPossible;
    }

    isInRepair(fleet: Fleet) {
        return this.fleetsInRepair.indexOf(fleet.idFleet) != -1;
    }

    getPercentage(fleet: Fleet) {
        let max = 0;
        fleet.baseSpacecraftCapabilities.capabilities.forEach(value => max += value.value);

        let current = 0;
        const currentCaps = fleet.spacecraftCapabilities;
        if (!currentCaps) {
            current = max;
        } else {
            currentCaps.capabilities.forEach(value => current += value.value);
        }
        return Math.round((current / max) * 100);
    }

    getPercentageString(fleet: Fleet) {
        return this.translations.get('planetary.fleets-in-orbit.percentage-message')! + ' ' + this.getPercentage(fleet) + ' %';
    }

    repair(fleet: Fleet) {
        let sub = this.planetApi.repairFleets(fleet.idFleet).subscribe(resp => {
            if (resp) {
                this.snackbar.open(this.translations.get('planetary.fleets-in-orbit.repair-job-started-message')!);
            }
        });
        this.subscriptions.push(sub);
    }

    getRepairJobButtonText(fleet: Fleet) {
        if (!fleet.state.needsRepair) {
            return this.translations.get('planetary.fleets-in-orbit.repair-btn.no-repair-needed')!;
        }
        if (this.isInRepair(fleet)) {
            return this.translations.get('planetary.fleets-in-orbit.repair-btn.is-in-repair')!;
        }
        if (!this.shipyardExists) {
            return this.translations.get('planetary.fleets-in-orbit.repair-btn.no-shipyard')!;
        }
        if (!this.shipyardJobPossible) {
            return this.translations.get('planetary.fleets-in-orbit.repair-btn.already-in-use')!;
        }
        return this.translations.get('planetary.fleets-in-orbit.repair-btn.start-job')!;
    }

    isInoperational(fleet: Fleet) {
        return !fleet.state.isOperational;
    }

    upgradeAll(fleet: Fleet) {

    }

    upgradePossible(fleet: Fleet) {

        //fleet.ships.map(w => w.shipClass.i)

        return false;
    }
}
