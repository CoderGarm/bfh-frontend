import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {Fleet, Job, OrbitalStructures, WarShip} from "../../../services/swagger";
import {coerceBooleanProperty} from "@angular/cdk/coercion";

@Component({
    selector: 'app-job-display',
    templateUrl: './job-display.component.html',
    styleUrls: ['./job-display.component.scss']
})
export class JobDisplayComponent implements OnChanges {

    @Input()
    job?: Job;

    // @formatter:off
    @Input()
    get noIcon() { return this._noIcon; }
    set noIcon(value: any) { this._noIcon = coerceBooleanProperty(value); }
    _noIcon: boolean = false;

    @Input()
    get paused() { return this._paused; }
    set paused(value: any) { this._paused = coerceBooleanProperty(value); }
    _paused: boolean = false;
    // @formatter:on

    shipClassMap: Map<string, number> = new Map<string, number>();
    orbitalStructureMap: Map<string, number> = new Map<string, number>();
    title: string = '';

    ngOnChanges(changes: SimpleChanges) {
        this.shipClassMap.clear();
        this.orbitalStructureMap.clear();
        if (!!this.job) {
            if (!!this.job.fleet) {
                this.title = this.job.fleet.name;
                this.job.fleet.ships.forEach((s: WarShip) => {
                    const key = s.shipClass.name + " Flt. " + s.shipClass.mark;
                    let count = this.shipClassMap.has(key) ? this.shipClassMap.get(key)! : 0;
                    count++;
                    this.shipClassMap.set(key, count);
                });
            }
            this.title = this.title.length > 0 ? this.title : 'Orbitals';
            this.job.orbitalStructures.forEach((s: OrbitalStructures) => {
                const key = s.module.name;
                let count = this.orbitalStructureMap.has(key) ? this.orbitalStructureMap.get(key)! : 0;
                count++;
                this.orbitalStructureMap.set(key, count);
            });
        }
    }

    getPercentage(fleet?: Fleet) {
        if (!fleet) {
            return '';
        }

        let max = 0;
        fleet.spacecraftCapabilities.capabilities.forEach(value => max += value.value);

        let current = 0;
        const currentCaps = fleet.spacecraftCapabilities;
        if (!currentCaps) {
            current = max;
        } else {
            currentCaps.capabilities.forEach(value => current += value.value);
        }
        return Math.round((current / max) * 100) + " %";
    }
}
