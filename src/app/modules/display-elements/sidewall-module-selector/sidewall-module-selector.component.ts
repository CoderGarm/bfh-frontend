import {AfterViewInit, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {BaseModule, Sidewall} from "../../../services/swagger";

@Component({
    selector: 'app-sidewall-module-selector',
    templateUrl: './sidewall-module-selector.component.html',
    styleUrls: ['./sidewall-module-selector.component.scss']
})
export class SidewallModuleSelectorComponent implements AfterViewInit, OnChanges {

    /**
     * the module which should be displayed
     */
    @Input()
    moduleInput!: Sidewall;

    /**
     * the module which should be displayed
     */
    @Input()
    moduleSelectedInput?: Sidewall;
    moduleSelectedInputDefinition: string = "moduleSelectedInput";

    /**
     * the sidewall which must be checked
     */
    @Output()
    moduleToCheckOutput: EventEmitter<BaseModule> = new EventEmitter<BaseModule>();

    /**
     * the currently selected amount
     */
    @Output()
    selectionOutput: EventEmitter<Sidewall> = new EventEmitter<Sidewall>();

    /**
     * the name of the radio group which will be used by all radio buttons inside of this scope
     */
    radioGroupName: string = "sidewallGroup";

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
