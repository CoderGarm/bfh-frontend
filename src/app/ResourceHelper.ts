import {Acceleration, ResourceDeposit} from "./services/swagger";

export class ResourceHelper {

    /**
     * Calculates if you can pay the bill
     *
     * @param costs the costs
     * @param deposit the account which must pay
     */
    static canPayTheBill(costs: ResourceDeposit, deposit: ResourceDeposit): boolean {

        let map = new Map<string, number>();
        costs.resources.forEach(costAmount => {
            let resourceType = costAmount.resourceType;
            let toPay = costAmount.amount;
            map.set(resourceType.typeName, toPay);
        });
        costs.humanResources.forEach(costAmount => {
            let resourceType = costAmount.resourceType;
            let toPay = costAmount.amount;
            map.set(resourceType.typeName, toPay);
        });

        let canPay: boolean = true;
        map.forEach((toPay, resourceTypeName) => {
            let depositedResource = deposit.resources.filter(dep => dep.resourceType.typeName === resourceTypeName);
            let depositedHuman = deposit.humanResources.filter(dep => dep.resourceType.typeName === resourceTypeName);
            if (depositedHuman.length == 0 && depositedResource.length == 0) {
                canPay = false;
                return;
            }

            if (depositedResource.length != 0) {
                let depositAmount = depositedResource[0];
                let currentAmount = depositAmount.amount;
                if (currentAmount < toPay) {
                    canPay = false;
                    return;
                }
            }

            if (depositedHuman.length != 0) {
                let depositAmount = depositedHuman[0];
                let currentAmount = depositAmount.amount;
                if (currentAmount < toPay) {
                    canPay = false;
                    return;
                }
            }
        });
        return canPay;
    }
}
