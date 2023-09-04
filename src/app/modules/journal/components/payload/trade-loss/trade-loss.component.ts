import {Component, Input} from '@angular/core';
import {ConvoyRaidActionItemGroup} from "../../../../../services/swagger";

@Component({
    selector: 'app-trade-loss',
    templateUrl: './trade-loss.component.html',
    styleUrls: ['./trade-loss.component.scss']
})
export class TradeLossComponent {

    @Input()
    loss?: ConvoyRaidActionItemGroup;

}
