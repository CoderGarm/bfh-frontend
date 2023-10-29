import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {Fleet, Job} from "../../../services/swagger";

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
    set noIcon(value: any) { this._noIcon = this.coerceBooleanProperty(value); }
    _noIcon: boolean = false;

    @Input()
    get paused() { return this._paused; }
    set paused(value: any) { this._paused = this.coerceBooleanProperty(value); }
    _paused: boolean = false;
    // @formatter:on

    shipClassMap: Map<string, number> = new Map<string, number>();

    private coerceBooleanProperty(value: any): boolean {
        return value != null && `${value}` !== 'false';
    }

    ngOnChanges(changes: SimpleChanges) {
        this.shipClassMap.clear();
        if (!!this.job && !!this.job.fleet) {
            this.job.fleet.ships.forEach(s => {
                const key = s.shipClass.name + " Flt. " + s.shipClass.mark;
                let count = this.shipClassMap.has(key) ? this.shipClassMap.get(key)! : 0;
                count++;
                this.shipClassMap.set(key, count);
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
