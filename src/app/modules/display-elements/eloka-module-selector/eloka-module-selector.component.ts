import {AfterViewInit, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {BaseModule, ElectronicWarfare} from "../../../services/swagger";

@Component({
    selector: 'app-eloka-module-selector',
    templateUrl: './eloka-module-selector.component.html',
    styleUrls: ['./eloka-module-selector.component.scss']
})
export class ElokaModuleSelectorComponent implements AfterViewInit, OnChanges {


    /**
     * the module which should be displayed
     */
    @Input()
    moduleInput!: ElectronicWarfare;

    /**
     * the module which should be displayed
     */
    @Input()
    moduleSelectedInput?: ElectronicWarfare;
    moduleSelectedInputDefinition: string = "moduleSelectedInput";

    /**
     * the propulsion which must be checked
     */
    @Output()
    moduleToCheckOutput: EventEmitter<BaseModule> = new EventEmitter<BaseModule>();

    /**
     * the currently selected amount
     */
    @Output()
    selectionOutput: EventEmitter<ElectronicWarfare> = new EventEmitter<ElectronicWarfare>();

    /**
     * the name of the radio group which will be used by all radio buttons inside of this scope
     */
    radioGroupName: string = "elokaGroup";

    constructor() {
    }

    ngAfterViewInit(): void {
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

    /**
     * sets the amount and emits it
     */
    emitSelection() {
        this.selectionOutput.emit(this.moduleInput);
    }
}
