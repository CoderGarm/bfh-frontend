import {Component, EventEmitter, Input, Output, TemplateRef, ViewChild} from '@angular/core';


export interface RadialMenuItem {
    label?: string;
    labelKey?: string;
    icon?: string;
    menuItemKey: string;
    disabled: boolean;
}

@Component({
    selector: 'app-radial-menu',
    templateUrl: './radial-menu.component.html',
    styleUrls: ['./radial-menu.component.scss']
})
export class RadialMenuComponent {

    @ViewChild('menu', {static: true})
    menu!: TemplateRef<any>;

    @Input()
    menuItems: RadialMenuItem[] = [];

    @Output()
    menuItemClick = new EventEmitter<RadialMenuItem>();

    constructor() {
    }

    onMenuItemOneClick(selected: RadialMenuItem) {
        console.log("RadialMenuComponent", selected)
        this.menuItemClick.emit(selected);
    }
}
