import {EDepositType, EnumValueDto} from "./services/swagger";

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
}