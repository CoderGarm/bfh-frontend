import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {EResourceType, ResourceAmount} from "../../../../services/swagger";

@Component({
    selector: 'app-resource-counter',
    templateUrl: './resource-counter.component.html',
    styleUrls: ['./resource-counter.component.scss']
})
export class ResourceCounterComponent implements OnInit {

    @Input()
    resourceType?: EResourceType;

    @Output()
    numericEmitter: EventEmitter<ResourceAmount> = new EventEmitter();

    /**
     * the base start amount if not changes
     */
    @Input()
    startAt: number = 0;

    /**
     * defines the minimum value
     */
    @Input()
    min: number = 0;

    /**
     * defines the maximum value
     */
    @Input()
    max: number = Number.MAX_VALUE;

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
        const r: ResourceAmount = {
            amount: event,
            resourceType: this.resourceType
        }
        this.numericEmitter.emit(r)
    }
}
