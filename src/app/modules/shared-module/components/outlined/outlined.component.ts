import {Component, Input} from '@angular/core';

@Component({
    selector: 'app-outlined',
    templateUrl: './outlined.component.html',
    styleUrls: ['./outlined.component.scss']
})
export class OutlinedComponent {

    @Input()
    titleValue: string = '';
}
