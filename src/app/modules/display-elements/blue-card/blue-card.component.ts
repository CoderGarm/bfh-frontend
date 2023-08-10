import {Component, Input} from '@angular/core';

@Component({
    selector: 'app-blue-card',
    templateUrl: './blue-card.component.html',
    styleUrls: ['./blue-card.component.scss']
})
export class BlueCardComponent {

    // @formatter:off
    @Input()
    get rightBlueCard() { return this._rightBlueCard; }
    set rightBlueCard(value: any) { this._rightBlueCard = this.coerceBooleanProperty(value); }
    _rightBlueCard: boolean = false;
    // @formatter:on

    private coerceBooleanProperty(value: any): boolean {
        return value != null && `${value}` !== 'false';
    }
}
