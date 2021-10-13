import {AfterViewInit, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {Armor, BaseModule} from "../../../services/swagger";

@Component({
    selector: 'app-armor-module-selector',
    templateUrl: './armor-module-selector.component.html',
    styleUrls: ['./armor-module-selector.component.scss']
})
export class ArmorModuleSelectorComponent implements AfterViewInit, OnChanges {


    /**
     * the module which should be displayed
     */
    @Input()
    moduleInput!: Armor;

    /**
     * the module which should be displayed
     */
    @Input()
    moduleSelectedInput?: Armor;
    moduleSelectedInputDefinition: string = "moduleSelectedInput";

    /**
     * the armor which must be checked
     */
    @Output()
    moduleToCheckOutput: EventEmitter<BaseModule> = new EventEmitter<BaseModule>();

    /**
     * the currently selected amount
     */
    @Output()
    selectionOutput: EventEmitter<Armor> = new EventEmitter<Armor>();

    /**
     * the name of the radio group which will be used by all radio buttons inside of this scope
     */
    radioGroupName: string = "armorGroup";

    constructor() {
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes[this.moduleSelectedInputDefinition]) {
            let newVar;
            if (!!this.moduleSelectedInput) {
                newVar = this.moduleSelectedInput.baseModule
            }
            this.moduleToCheckOutput.emit(newVar);
        }
    }

    ngAfterViewInit(): void {
    }

    /**
     * sets the amount and emits it
     */
    emitSelection() {
        this.selectionOutput.emit(this.moduleInput);
    }
}
