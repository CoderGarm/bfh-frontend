import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {EEducationType, HumanResourceAmount} from "../../../../services/swagger";

@Component({
    selector: 'app-human-resource-counter',
    templateUrl: './human-resource-counter.component.html',
    styleUrls: ['./human-resource-counter.component.scss']
})
export class HumanResourceCounterComponent implements OnInit {

    @Input()
    resourceType?: EEducationType;

    @Output()
    numericEmitter: EventEmitter<HumanResourceAmount> = new EventEmitter();

    /**
     * the base start amount if not changes
     */
    @Input()
    startAt: number = 0;

    /**
     * defines the minimum value
     */
    @Input()
    min: number = Number.NEGATIVE_INFINITY;

    /**
     * defines the maximum value
     */
    @Input()
    max: number = Number.POSITIVE_INFINITY;

    /**
     * if the input elements must be disabled
     */
    @Input()
    disabled: boolean = false;

    /**
     * The caption of the field.
     */
    @Input()
    caption: string = '';

    constructor() {
    }

    ngOnInit(): void {
    }

    setAmount(event: number) {
        if (!this.resourceType) {
            return;
        }
        const r: HumanResourceAmount = {
            amount: event,
            resourceType: this.resourceType
        }
        this.numericEmitter.emit(r)
    }

    getLink(resourceType: EEducationType): string {
        let folder = resourceType.folder;
        let iconName = resourceType.iconName;
        return "assets/" + folder + "/png16x/" + iconName + "_c.png";
    }
}
