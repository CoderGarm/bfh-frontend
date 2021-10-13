import {AfterViewInit, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild} from '@angular/core';
import {BaseModule} from "../../../services/swagger";
import {MatRadioButton} from "@angular/material/radio";

@Component({
    selector: 'app-base-module-single-selector',
    templateUrl: './base-module-single-selector.component.html',
    styleUrls: ['./base-module-single-selector.component.scss']
})
export class BaseModuleSingleSelectorComponent implements AfterViewInit, OnChanges {

    /**
     * the module which should be displayed
     */
    @Input()
    moduleInput!: BaseModule;

    /**
     * the module which should be checked
     */
    @Input()
    moduleSelectedInput?: EventEmitter<BaseModule>;
    moduleSelectedInputDefinition: string = "moduleSelectedInput";

    /**
     * the currently selected module
     */
    @Output()
    selectionOutput: EventEmitter<BaseModule> = new EventEmitter<BaseModule>();

    @Input()
    radioGroupName?: string;

    @ViewChild(MatRadioButton)
    radioButton?: MatRadioButton;

    constructor() {
    }

    ngAfterViewInit(): void {
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes[this.moduleSelectedInputDefinition]) {
            if (!!this.moduleSelectedInput) {
                this.moduleSelectedInput.subscribe(baseModule => {
                    let cssId;
                    if (!!baseModule) {
                        cssId = this.getCssId(baseModule);
                    }
                    this.check(cssId);
                });
            }
        }
    }


    /**
     * checks the radio button which if the id suits this
     * @param id
     * @private
     */
    private check(id?: string) {
        if (!!this.radioButton) {
            if (!!id && this.radioButton.id === id) {
                this.checkRB(true);
            } else {
                this.checkRB(false);
            }
        }
    }

    /**
     * check the radio button with a small timeout
     *
     * @param checked true to check, false to uncheck
     * @private
     */
    private checkRB(checked: boolean) {
        setTimeout(() => {
            // because of https://angular.io/errors/NG0100
            if (!!this.radioButton) {
                this.radioButton.checked = checked;
            }
        }, 100);
    }

    emitSelection() {
        this.selectionOutput.emit(this.moduleInput);
    }

    /**
     * creates the css selector
     * @param moduleInput
     */
    getCssId(moduleInput: BaseModule) {
        return moduleInput.idModule + "-" + moduleInput.name;
    }
}
