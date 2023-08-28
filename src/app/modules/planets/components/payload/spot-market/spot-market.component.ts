import {Component, Input} from '@angular/core';
import {EnumValueDto, EResourceType, HumanResourceAmount, MarketplaceApiService, Planet, ResourceAmount, SpotOffer} from "../../../../../services/swagger";
import {SubscriptionManager} from "../../../../../subscription.manager";
import {CdkOverlayOrigin} from "@angular/cdk/overlay";
import {TranslateService} from "@ngx-translate/core";
import {TypeService} from "../../../../../services/type.service";
import {SnackbarNotificationService} from "../../../../../services/snackbar-notification.service";
import {interval} from "rxjs";
import {AppComponent} from "../../../../../app.component";
import {PlanetsEventService} from "../../../planets-event.service";
import EResourceTypeEnum = EnumValueDto.EResourceTypeEnum;

@Component({
    selector: 'app-spot-market',
    templateUrl: './spot-market.component.html',
    styleUrls: ['./spot-market.component.scss']
})
export class SpotMarketComponent extends SubscriptionManager {

    @Input()
    planet?: Planet;

    @Input()
    resourceDeposit: ResourceAmount[] = [];

    @Input()
    presentMoney: number = 0;

    tradableResourceTypes: EResourceType[] = [];

    tradeMode: string = 'sell';

    credits!: EResourceType;
    theOffer?: ResourceAmount;
    thePrice!: ResourceAmount;
    theTotal!: ResourceAmount;

    resourceToOffer?: ResourceAmount;

    spotPriceByResourceType: Map<string, number> = new Map<string, number>();
    activeSpotPriceUpdateByResourceType: Map<string, boolean> = new Map<string, boolean>();

    isOpenSpotOffer: boolean = false;
    triggerSpotOffer: any;
    maxToBuy: number = 0;

    constructor(private translate: TranslateService,
                private plantNotifService: PlanetsEventService,
                private typeService: TypeService,
                private notif: SnackbarNotificationService,
                private marketService: MarketplaceApiService) {
        super();

        this.setUpTradableResources();

        if (!this.credits) {
            throw new Error("Yes but no. Repair me.")
        }
        const source = interval(AppComponent.CHECK_MESSAGES_INTERVAL_IN_SECONDS);
        let sub = source.subscribe(() => this.fetchSpotPrices());
        this.subscriptions.push(sub);
        this.plantNotifService.getOfferCreatedEmitter().subscribe(() => this.fetchSpotPrices());
    }

    private setUpTradableResources() {
        this.credits = this.typeService.collectableResourceTypes.filter(rt => rt.typeName === EResourceTypeEnum.CREDITS)[0];
        this.tradableResourceTypes = this.typeService.collectableResourceTypes.filter(r => r.typeName != this.credits.typeName);
        this.thePrice = {amount: 0, resourceType: this.credits};
        this.theTotal = {amount: 0, resourceType: this.credits};
        this.tradableResourceTypes.forEach(r => this.spotPriceByResourceType.set(r.typeName, 0));
        this.fetchSpotPrices();
    }

    private fetchSpotPrices() {
        this.tradableResourceTypes.forEach(r => {
            this.activeSpotPriceUpdateByResourceType.set(r.typeName, true);
            let sub = this.marketService.getSpotPrice(r.typeName).subscribe(resp => {
                setTimeout(() => {
                    this.spotPriceByResourceType.set(r.typeName, resp);
                    this.activeSpotPriceUpdateByResourceType.set(r.typeName, false);
                }, 3000);
            });
            this.subscriptions.push(sub);
        });
    }

    calcTotal() {
        let price = 0;
        if (!!this.theOffer && !!this.thePrice) {
            price = this.thePrice.amount * this.theOffer.amount;
        }
        this.theTotal.amount = price;
        this.maxToBuy = Math.floor(this.presentMoney / this.thePrice.amount);
    }

    displaySpotOffer(resourceType: EResourceType, trigger: CdkOverlayOrigin) {
        this.isOpenSpotOffer = !this.isOpenSpotOffer;
        this.triggerSpotOffer = trigger;
        this.theOffer = {resourceType: resourceType, amount: 0};
        const resourceAmounts = this.resourceDeposit.filter(r => r.resourceType.typeName === resourceType.typeName);
        const presentAmount = resourceAmounts.length == 1 ? resourceAmounts[0].amount : 0;
        this.resourceToOffer = {resourceType: resourceType, amount: presentAmount};
        this.thePrice.amount = this.spotPriceByResourceType.get(resourceType.typeName)!;
        this.calcTotal();
    }

    closeSpotOfferCreation() {
        this.isOpenSpotOffer = false;
        this.triggerSpotOffer = undefined;
        this.theOffer = undefined;
        this.theTotal.amount = 0;
        this.thePrice.amount = 0;
    }

    setSpotOffer(event: ResourceAmount | HumanResourceAmount) {
        this.theOffer = <ResourceAmount>event;
        this.calcTotal();
    }

    createSpotOffer() {
        let sub;

        const spotOffer: SpotOffer = {
            idPlanet: this.planet!.idPlanet,
            resourceAmount: this.theOffer!
        }

        if (this.tradeMode === 'sell') {
            sub = this.marketService.sellAtSpotMarket(spotOffer).subscribe(() => {
                this.plantNotifService.fireOfferCreated();
                this.closeSpotOfferCreation();
            });
        } else {
            sub = this.marketService.buyAtSpotMarket(spotOffer).subscribe(() => {
                this.plantNotifService.fireOfferCreated();
                this.closeSpotOfferCreation();
            });
        }
        this.subscriptions.push(sub);
    }

    clearOffer() {
        if (!!this.theOffer) {
            this.theOffer.amount = 0;
        }
        this.calcTotal();
    }
}
