import {AfterContentInit, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild} from '@angular/core';
import {UntypedFormControl} from "@angular/forms";
import {MatChipListbox} from "@angular/material/chips";
import {MatIcon} from "@angular/material/icon";

export interface ChipSelectorValue {
    value: string;
    trailingIcon?: string | MatIcon;
    leadingIcon?: string | MatIcon;
}

export interface ChipSelectorValueResult {
    chipValue: string;
    selected: boolean;
}

@Component({
    selector: 'app-chip-selector',
    templateUrl: './chip-selector.component.html',
    styleUrls: ['./chip-selector.component.scss']
})
export class ChipSelectorComponent implements AfterContentInit, OnChanges {

    @Input()
    titleValue: string = '';

    @Input()
    chipValues: ChipSelectorValue[] = [];
    chipValuesDefinition: string = 'chipValues';

    @Output()
    chipValuesChange: EventEmitter<ChipSelectorValueResult[]> = new EventEmitter<ChipSelectorValueResult[]>();

    // @formatter:off
    @Input()
    get toggleForbidden() { return this._toggleForbidden; }
    set toggleForbidden(value: any) { this._toggleForbidden = this.coerceBooleanProperty(value); }
    _toggleForbidden: boolean = false;

    @Input()
    get noCheckmark() { return this._noCheckmark; }
    set noCheckmark(value: any) { this._noCheckmark = this.coerceBooleanProperty(value); }
    _noCheckmark: boolean = false;

    @Input()
    get multiple() { return this._multiple; }
    set multiple(value: any) { this._multiple = this.coerceBooleanProperty(value); }
    _multiple: boolean = false;

    @Input()
    get preSelect() { return this._preSelect; }
    set preSelect(value: any) { this._preSelect = this.coerceBooleanProperty(value); }
    _preSelect: boolean = false;
    // @formatter:on

    @Input()
    trailingIcon?: string;

    @ViewChild('chipList')
    chipList!: MatChipListbox;

    chipControl: UntypedFormControl = new UntypedFormControl({});

    constructor() {
        /* todo give me trailing icons*/
    }

    ngOnChanges(changes: SimpleChanges) {
        const change = changes[this.chipValuesDefinition];
        if (!!change && this.chipValues.length > 0) {
            if (this._preSelect) {
                setTimeout(() => {
                    this.selectAll();
                }, 50);
            }
        }
    }

    private selectAll() {
        if (this._preSelect && this.chipValues.length > 0) {
            this.chipList._chips.forEach(chip => chip.select());
            this.sendOutput();
        }
    }

    ngAfterContentInit() {
    }

    private coerceBooleanProperty(value: any): boolean {
        return value != null && `${value}` !== 'false';
    }

    toggle() {
        if (this._multiple && !this._toggleForbidden && !!this.chipList) {
            let selected = this.chipList._chips.filter(chip => chip.selected);
            let unselected = this.chipList._chips.filter(chip => !chip.selected);
            if (selected.length > unselected.length) {
                this.chipList._chips.forEach(chip => chip.deselect());
            } else {
                this.chipList._chips.forEach(chip => chip.select());
            }
            this.sendOutput();
        }
    }

    sendOutput() {
        if (!!this.chipList) {
            let chips: ChipSelectorValueResult[] = this.chipValues.map(chip => ({chipValue: chip.value, selected: false}));
            this.chipList._chips.filter(chip => chip.selected).forEach(chip => {
                chips.filter(c => c.chipValue === chip.value).forEach(c => c.selected = true);
            });
            this.chipValuesChange.emit(chips);
        }
    }
}
