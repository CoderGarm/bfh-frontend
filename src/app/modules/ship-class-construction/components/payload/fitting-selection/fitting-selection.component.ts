import {AfterViewInit, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {Subscription} from "rxjs";
import {AlignedFitting, ShipClass, ShipyardApiService} from "../../../../../services/swagger";
import {TokenStorage} from "../../../../../services/authentication/token-storage.service";
import {FormControl, FormGroup} from "@angular/forms";
import {ShipClassNamePatternErrorMessages} from "../../../../../validators/shipNamePatternValidator";

@Component({
    selector: 'app-fitting-selection',
    templateUrl: './fitting-selection.component.html',
    styleUrls: ['./fitting-selection.component.scss']
})
export class FittingSelectionComponent implements AfterViewInit, OnChanges {

    private subscriptions: Subscription[] = [];

    /**
     * The user selected ShipClass.
     */
    @Input()
    selectedShipClassInput?: ShipClass;
    selectedShipClassInputDefinition: string = "selectedShipClassInput";

    /**
     * listens to the parents event which tab is selected
     */
    @Input()
    selectedIndexInput?: EventEmitter<number>;
    selectedIndexInputDefinition: string = "selectedIndexInput";

    /**
     * emits an event if this component was selected in the parent's tab group and was rendered
     */
    @Output()
    isSelectedOutput: EventEmitter<boolean> = new EventEmitter<boolean>();

    /**
     * the css selector which should be used to create the svg div in the svg component
     */
    svgSelector: string = "ship-class-fitting-selection";

    /**
     * the displayed ship class name
     */
    @Output()
    shipClassNameOutput?: string;

    /**
     * forwards the weapon alignments by amount to the svg component
     */
    @Output()
    weaponsAmountByAlignmentOutput: EventEmitter<Map<AlignedFitting.WeaponAlignmentEnum, number>> = new EventEmitter<Map<AlignedFitting.WeaponAlignmentEnum, number>>();

    /**
     * if the ship class which was created by the user is valid, it will appear here
     */
    designedShipClassInput?: ShipClass;

    /**
     * the state of the store-button
     */
    disabled: boolean = true;

    /**
     * the event emitter that communicates the successful creation of a new class
     */
    @Output()
    modifiedShipClassOutput: EventEmitter<ShipClass> = new EventEmitter<ShipClass>();

    /**
     * all possible errors to display
     */
    errors = ShipClassNamePatternErrorMessages;

    /**
     * the form group which defines the name field
     */
    form: FormGroup = new FormGroup({
        scName: new FormControl({value: '', disabled: !!this.selectedShipClassInput})
    });

    constructor(private shipYardApi: ShipyardApiService, private tokenStorage: TokenStorage) {
    }

    ngAfterViewInit(): void {
        // detect changed value
        let sub = this.form.controls.scName.valueChanges.subscribe(value => {
            if (this.shipClassNameOutput != value) {
                this.shipClassNameOutput = value;
            }
        });
        this.subscriptions.push(sub);
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes[this.selectedIndexInputDefinition]) {
            if (!!this.selectedIndexInput) {
                let sub = this.selectedIndexInput.subscribe(event => {
                    if (event == 1) {
                        this.isSelectedOutput.emit(true);
                    }
                });
                this.subscriptions.push(sub);
            }
        }
        if (changes[this.selectedShipClassInputDefinition]) {
            // detecting ship class name
            if (!!this.selectedShipClassInput) {
                this.shipClassNameOutput = this.selectedShipClassInput.name;
            } else {
                this.shipClassNameOutput = '';
            }
            // setting detected name
            this.form.controls.scName.setValue(this.shipClassNameOutput);
            // enable or disable input depending on if the name could be changed or is fixed
            if (!!this.selectedShipClassInput) {
                this.form.controls.scName.disable();
            } else {
                this.form.controls.scName.enable();
            }
        }
    }

    ngOnDestroy() {
        this.subscriptions.forEach(subscription => subscription.unsubscribe());
    }

    /**
     * forwards the weapon alignments by amount to the svg component
     * @param event
     */
    setWeaponsAmountByAlignmentInput(event: Map<AlignedFitting.WeaponAlignmentEnum, number>) {
        this.weaponsAmountByAlignmentOutput.emit(event);
    }

    /**
     * stores the designed class to the database
     */
    storeClass() {
        let userID = this.tokenStorage.getUserID();
        if (!!userID && !!this.designedShipClassInput) {
            let sub = this.shipYardApi.setShipClass(userID, this.designedShipClassInput).subscribe(resp => {
                this.modifiedShipClassOutput.emit(resp);
            });
            this.subscriptions.push(sub);
        }
    }

    /**
     * sets the ship class and detects the state of the store-button
     * @param shipClass
     */
    setShipClass(shipClass?: ShipClass) {
        this.designedShipClassInput = shipClass;
        if (this.disabled != !this.designedShipClassInput) {
            // to this only if changed not the https://angular.io/errors/NG0100 error
            // and the svg which will not be rendered if this timeout is present at the initial rendering
            setTimeout(() => {
                this.disabled = !this.designedShipClassInput;
            }, 200);
        }
    }

    /**
     * deletes the stored ship class
     */
    deleteClass() {
        let userID = this.tokenStorage.getUserID();
        if (!!userID && !!this.designedShipClassInput) {
            let idShipClass = this.designedShipClassInput.idShipClass;
            if (!idShipClass) {
                return;
            }
            let sub = this.shipYardApi.deleteShipClass(userID, idShipClass).subscribe(resp => {
                this.modifiedShipClassOutput.emit(resp);
            });
            this.subscriptions.push(sub);
        }
    }
}
