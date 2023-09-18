import {Component, Input} from '@angular/core';
import {EShipClassType, Fleet, Job} from "../../../services/swagger";

@Component({
    selector: 'app-job-display',
    templateUrl: './job-display.component.html',
    styleUrls: ['./job-display.component.scss']
})
export class JobDisplayComponent {

    @Input()
    job?: Job;

    // @formatter:off
    @Input()
    get noIcon() { return this._noIcon; }
    set noIcon(value: any) { this._noIcon = this.coerceBooleanProperty(value); }
    _noIcon: boolean = false;
    // @formatter:on

    private coerceBooleanProperty(value: any): boolean {
        return value != null && `${value}` !== 'false';
    }

    getHullCount(fleet?: Fleet) {
        if (!fleet) {
            return '';
        }

        let m: Map<EShipClassType, number> = new Map<EShipClassType, number>();
        fleet.ships.forEach(w => {
            const hullType = w.shipClass.shipClassType;
            let amount = m.get(hullType);
            if (!amount) {
                amount = 0;
            }
            amount += 1;
            m.set(hullType, amount);
        });
        let result = "";
        m.forEach((amount, hullType) => result += ", " + amount + " " + hullType.typeName);
        return fleet.ships.length + " ships";
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
