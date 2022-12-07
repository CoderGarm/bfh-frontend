import {Construction, EEducationType, EnumValueDto, EResourceType, HumanResourceAmount, ResourceAmount, ResourceDeposit} from "./services/swagger";
import {PlanetaryResourceTransportation} from "./modules/transportation/payload/components/transportation-resource-demand/transportation-resource-demand.component";
import {PlanetaryHumanTransportation} from "./modules/transportation/payload/components/transportation-humans-demand/transportation-humans-demand.component";
import EDepositTypeEnum = EnumValueDto.EDepositTypeEnum;

export class ResourceHelper {

    static calculateLevelOutput(construction: Construction | undefined): number {
        if (!construction) {
            return 0;
        }
        let level = construction.level;
        let baseValue = construction.building.baseValue;
        let increasingFactorPerLevel = construction.building.increasingFactorPerLevel;
        let valueAtLevel;
        if (level === 1) {
            valueAtLevel = baseValue;
        } else {
            valueAtLevel = Math.round(baseValue + (baseValue * level * increasingFactorPerLevel));
        }
        return valueAtLevel;
    }

    /**
     * Calculates if you can pay the bill.<br>
     * <b>Attention:<b> This excludes the population.
     *
     * @param costs the costs
     * @param deposit the account which must pay
     */
    static canPayTheCollectableBill(costs: ResourceDeposit, deposit: ResourceDeposit): boolean {

        let map = new Map<string, number>();
        costs.resources.forEach(costAmount => {
            let resourceType = costAmount.resourceType;
            if (resourceType.collectableType === EResourceType.CollectableTypeEnum.COLLECTABLE) {
                let toPay = costAmount.amount;
                map.set(resourceType.typeName, toPay);
            }
        });

        let canPay: boolean = true;
        map.forEach((toPay, resourceTypeName) => {
            let depositedResource = deposit.resources.filter(dep => dep.resourceType.typeName === resourceTypeName);
            if (depositedResource.length == 0) {
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
        });
        return canPay;
    }

    /**
     * Calculates if you can pay the bill.<br>
     * <b>Attention:<b> This includes in population.
     *
     * @param costs the costs
     * @param deposit the account which must pay
     */
    static canPayTheBill(costs: ResourceDeposit, deposit: ResourceDeposit): boolean {

        let map = new Map<string, number>();
        costs.resources.forEach(costAmount => {
            let resourceType = costAmount.resourceType;
            if (resourceType.collectableType === EResourceType.CollectableTypeEnum.COLLECTABLE) {
                let toPay = costAmount.amount;
                map.set(resourceType.typeName, toPay);
            }
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

    /**
     * Adds the payment to the given bill.
     *
     * @param costs the payment
     * @param bill the bill
     */
    static addToBill(costs: ResourceDeposit, bill: ResourceDeposit): ResourceDeposit {

        costs.resources.forEach(costAmount => {
            let resourceType = costAmount.resourceType;
            if (resourceType.collectableType === EResourceType.CollectableTypeEnum.COLLECTABLE) {
                bill.resources.forEach(billAmount => {
                    if (billAmount.resourceType.typeName === resourceType.typeName) {
                        let toPay = costAmount.amount;
                        billAmount.amount += toPay;
                    }
                });
            }
        });
        costs.humanResources.forEach(costAmount => {
            let resourceType = costAmount.resourceType;
            bill.humanResources.forEach(billAmount => {
                if (billAmount.resourceType.typeName === resourceType.typeName) {
                    let toPay = costAmount.amount;
                    billAmount.amount += toPay;
                }
            });
        });
        return {
            resources: bill.resources,
            humanResources: bill.humanResources,
            subType: bill.subType
        };
    }

    /**
     * Reduces the payment from the given bill.
     *
     * @param costs the payment
     * @param bill the bill
     */
    static reduceTheBill(costs: ResourceDeposit, bill: ResourceDeposit): ResourceDeposit {

        costs.resources.forEach(costAmount => {
            let resourceType = costAmount.resourceType;
            if (resourceType.collectableType === EResourceType.CollectableTypeEnum.COLLECTABLE) {
                bill.resources.forEach(billAmount => {
                    if (billAmount.resourceType.typeName === resourceType.typeName) {
                        let toPay = costAmount.amount;
                        billAmount.amount -= toPay;
                    }
                });
            }
        });
        costs.humanResources.forEach(costAmount => {
            let resourceType = costAmount.resourceType;
            bill.humanResources.forEach(billAmount => {
                if (billAmount.resourceType.typeName === resourceType.typeName) {
                    let toPay = costAmount.amount;
                    billAmount.amount -= toPay;
                }
            });
        });
        return {
            resources: bill.resources,
            humanResources: bill.humanResources,
            subType: bill.subType
        };
    }

    static getBlankCosts(resourceTypes: EResourceType[], educationTypes: EEducationType[]): ResourceDeposit {
        return {
            resources: resourceTypes.map(type => {
                const am: ResourceAmount = {
                    resourceType: type,
                    amount: 0
                }
                return am;
            }),
            subType: {typeName: EDepositTypeEnum.COSTS},
            humanResources: educationTypes.map(type => {
                const am: HumanResourceAmount = {
                    resourceType: type,
                    amount: 0
                }
                return am;
            })
        };
    }

    static transformHumanTransportationToDeposit(event: PlanetaryHumanTransportation): ResourceDeposit {
        return {
            subType: {typeName: EDepositTypeEnum.TRANSPORTATIONDEMAND},
            humanResources: event.transportations,
            resources: []
        };
    }

    static transformResourceTransportationToDeposit(event: PlanetaryResourceTransportation): ResourceDeposit {
        return {
            subType: {typeName: EDepositTypeEnum.TRANSPORTATIONDEMAND},
            humanResources: [],
            resources: event.transportations
        };
    }

    static copy(deposit?: ResourceDeposit, resourceTypes?: EResourceType[], educationTypes?: EEducationType[]): ResourceDeposit | undefined {
        if (!deposit) {
            return undefined;
        }

        const r: ResourceDeposit = {
            subType: deposit.subType,
            resources: deposit.resources.filter(r => {
                if (!!resourceTypes) {
                    return resourceTypes.filter(type => type.typeName === r.resourceType.typeName).length > 0;
                }
                return true;
            }).map(r => {
                const rv: ResourceAmount = {
                    amount: r.amount,
                    resourceType: r.resourceType
                }
                return rv;
            }),
            humanResources: deposit.humanResources.filter(r => {
                if (!!educationTypes) {
                    return educationTypes.filter(type => type.typeName === r.resourceType.typeName).length > 0;
                }
                return true;
            }).map(r => {
                const rv: HumanResourceAmount = {
                    amount: r.amount,
                    resourceType: r.resourceType
                }
                return rv;
            })
        }
        return r;
    }
}
