import {Component, Input} from '@angular/core';

@Component({
    selector: 'app-red-box',
    templateUrl: './red-box.component.html',
    styleUrls: ['./red-box.component.scss']
})
export class RedBoxComponent {

    @Input()
    titleValue: string = '';
}
