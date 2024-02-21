import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {EnumValueDto, EShipClassType} from "../../../../../services/swagger";
import {AssetHelper} from "../../../../../services/helper/asset.helper";
import EShipClassTypeEnum = EnumValueDto.EShipClassTypeEnum;

@Component({
    selector: 'app-ship-imager',
    templateUrl: './ship-imager.component.html',
    styleUrls: ['./ship-imager.component.scss']
})
export class ShipImagerComponent implements OnChanges {

    @Input()
    shipClassType?: EShipClassType;

    path: string = '';

    ngOnChanges(changes: SimpleChanges) {
        if (!!this.shipClassType) {
            const type = <EShipClassTypeEnum>this.shipClassType.typeName;
            this.path = AssetHelper.getRandomShipClassImage(type);
        } else {
            this.path = '';
        }
        console.log(this.shipClassType, this.path)
    }
}
