import {EDepositType, EEducationType, EnumValueDto} from "./swagger";


export class StaticResourcesService {

    /**
     * Good to know.
     */
    private readonly values?: EnumValueDto;

    static getMatIconForDepositType(depositType: EDepositType) {
        const type = depositType.typeName as keyof typeof EnumValueDto.EDepositTypeEnum;
        switch (type) {
            default:
            case "CAPACITY":
                throw new Error("Please find an icon.");
            case "DEMAND":
                return 'crisis_alert';
            case "COSTS":
                return 'remove';
            case "DEPOSITS":
                return 'warehouse';
            case "INCOME":
                return 'add';
            case "UTILIZATION":
                return 'factory';
        }
    }

    static isMilitary(educationType: EEducationType) {
        const type = educationType.typeName as keyof typeof EnumValueDto.EEducationTypeEnum;
        switch (type) {
            case "ENLISTED":
            case "OFFICER":
                return true;
            case "SCHOOL":
            case "COLLEGE":
            case "NONE":
            case "UNIVERSITY":
            default:
                return false;
        }
    }

    static getHullLink(): string {
        let folder = 'hulls';
        let iconName = 'heavycruiser';
        return "assets/icons/" + folder + "/png24x/" + iconName + "_c.png";
    }
}