import {Pipe, PipeTransform} from "@angular/core";
import {BaseModule, Distance} from "../swagger";
import TechLevelEnum = BaseModule.TechLevelEnum;

@Pipe({name: 'techLevel'})
export class TechLevelPipe implements PipeTransform {

    constructor() {
    }

    transform(value: TechLevelEnum | undefined): string {
        switch (value) {
            case "TECH_I":
                return 'I';
            case "TECH_II":
                return 'II';
            case "TECH_III":
                return 'III';
            default:
                return '';
        }
    }
}