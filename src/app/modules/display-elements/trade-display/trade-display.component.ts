import {Component, Input} from '@angular/core';
import {TradeContract} from "../../../services/swagger";

@Component({
    selector: 'app-trade-display',
    templateUrl: './trade-display.component.html',
    styleUrls: ['./trade-display.component.scss']
})
export class TradeDisplayComponent {

    @Input()
    trade?: TradeContract;

    isOpen: boolean = false;
}
