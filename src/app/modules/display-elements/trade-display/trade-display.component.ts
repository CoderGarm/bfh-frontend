import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {TradeContract} from "../../../services/swagger";

@Component({
    selector: 'app-trade-display',
    templateUrl: './trade-display.component.html',
    styleUrls: ['./trade-display.component.scss']
})
export class TradeDisplayComponent implements OnChanges {

    @Input()
    trade?: TradeContract;

    leftOverResourceAmount: number = 0;

    ngOnChanges(changes: SimpleChanges) {
        if (!!this.trade && this.trade.isFinished) {
            this.leftOverResourceAmount = this.trade.offer.trade.resourceAmount.amount;
            this.trade.actionItems
                .filter(i => i.percentOfCargoLost > 0)
                .forEach(item => this.leftOverResourceAmount = this.leftOverResourceAmount * item.percentOfCargoLost / 100);
        }
    }
}
