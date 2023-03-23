import {Component, Input} from '@angular/core';
import {Distance, Launcher, Weapon} from "../../../services/swagger";
import {WeaponHelper} from "../../../services/helper/weapon.helper";
import {NavigationCalculator} from "../../../services/helper/navigation-calculator.helper";
import DistanceMetricEnum = Distance.DistanceMetricEnum;

@Component({
    selector: 'app-weapon-display',
    templateUrl: './weapon-display.component.html',
    styleUrls: ['./weapon-display.component.scss']
})
export class WeaponDisplayComponent {

    @Input()
    weapon?: Weapon | Launcher;

    getRange(weapon?: Weapon | Launcher): Distance {
        const result: Distance = {
            coordinate: 0,
            distanceMetric: DistanceMetricEnum.M
        };

        if (!!weapon) {
            if ('effectiveRange' in weapon) {
                result.coordinate = NavigationCalculator.convertDistanceToMetric(weapon.effectiveRange, DistanceMetricEnum.M);
            } else {
                result.coordinate = WeaponHelper.getMissileRange(weapon.allowedMissiles[0]) // todo fix missile selection
            }
        }
        return result
    }
}
