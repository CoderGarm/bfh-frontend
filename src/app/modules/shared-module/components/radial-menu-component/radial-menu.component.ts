import {Component, EventEmitter, Input, Output} from '@angular/core';


export interface RadialMenuItem {
    label?: string;
    labelKey?: string;
    icon?: string;
}

@Component({
    selector: 'app-radial-menu',
    templateUrl: './radial-menu.component.html',
    styleUrls: ['./radial-menu.component.scss']
})
export class RadialMenuComponent {

    @Input()
    menuItems: RadialMenuItem[] = [];

    @Output()
    menuItemClick = new EventEmitter<RadialMenuItem>();

    constructor() {
    }

    onMenuItemOneClick(selected: RadialMenuItem) {
        this.menuItemClick.emit(selected);
    }
}
