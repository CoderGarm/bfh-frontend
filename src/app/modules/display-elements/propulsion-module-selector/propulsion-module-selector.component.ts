import {AfterViewInit, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {BaseModule, Propulsion} from "../../../services/swagger";

@Component({
    selector: 'app-propulsion-module-selector',
    templateUrl: './propulsion-module-selector.component.html',
    styleUrls: ['./propulsion-module-selector.component.scss']
})
export class PropulsionModuleSelectorComponent implements AfterViewInit, OnChanges {

    /**
     * the module which should be displayed
     */
    @Input()
    moduleInput!: Propulsion;

    /**
     * the module which should be displayed
     */
    @Input()
    moduleSelectedInput?: Propulsion;
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
    selectionOutput: EventEmitter<Propulsion> = new EventEmitter<Propulsion>();

    /**
     * the name of the radio group which will be used by all radio buttons inside of this scope
     */
    radioGroupName: string = "propGroup";

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
     * emits the selection it
     */
    emitSelection() {
        this.selectionOutput.emit(this.moduleInput);
    }
}
