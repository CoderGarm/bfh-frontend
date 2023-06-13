import {AfterViewInit, ChangeDetectorRef, Component, Input, ViewChild} from '@angular/core';
import {EnumValueDto, EResourceType, MarketplaceApiService, Planet, ResourceAmount, TradeOffer} from "../../../../../services/swagger";
import {MatChip, MatChipListbox} from "@angular/material/chips";
import {UntypedFormControl} from "@angular/forms";
import {MatTableDataSource} from "@angular/material/table";
import {MatPaginator} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {TranslateService} from "@ngx-translate/core";
import {TypeService} from "../../../../../services/type.service";
import {SnackbarNotificationService} from "../../../../../services/snackbar-notification.service";
import {CdkOverlayOrigin} from "@angular/cdk/overlay";
import {SubscriptionManager} from "../../../../../subscription.manager";
import {PlanetsEventService} from "../../../planets-event.service";
import EResourceTypeEnum = EnumValueDto.EResourceTypeEnum;

@Component({
    selector: 'app-offer-market',
    templateUrl: './offer-market.component.html',
    styleUrls: ['./offer-market.component.scss']
})
export class OfferMarketComponent extends SubscriptionManager implements AfterViewInit {

    @Input()
    planet?: Planet;

    @Input()
    resourceDeposit: ResourceAmount[] = [];

    @Input()
    presentMoney: number = 0;

    tradableResourceTypes: EResourceType[] = [];

    @ViewChild('resourceTypeChipList')
    resourceTypeChipList!: MatChipListbox;

    eResourceTypeFC: UntypedFormControl = new UntypedFormControl({});

    selectedResourceTypes: EResourceType[] = [];

    private tradeOffers: TradeOffer[] = [];
    displayedColumns: string[] = ['resourceType', 'amount', 'price', 'ppu', 'take'];
    dataSource = new MatTableDataSource<TradeOffer>(this.tradeOffers);

    @ViewChild(MatPaginator)
    paginator!: MatPaginator;

    @ViewChild(MatSort)
    sort!: MatSort;

    triggerCreateOffer: any;
    isOpenCreateOffer = false;

    triggerEditOffer: any;
    isOpenEditOffer = false;

    resourceToOffer?: ResourceAmount;

    credits!: EResourceType;
    theOffer?: ResourceAmount;
    thePrice!: ResourceAmount;
    theTotal!: ResourceAmount;
    private idTradeOfferToEdit?: number;

    translations: Map<string, string> = new Map<string, string>();

    constructor(private translate: TranslateService,
                private plantNotifService: PlanetsEventService,
                private typeService: TypeService,
                private change: ChangeDetectorRef,
                private notif: SnackbarNotificationService,
                private marketService: MarketplaceApiService) {
        super();

        this.translations.set('planetary.marketplace.offer.created-notif', 'planetary.marketplace.offer.created-notif');
        let sub = this.translate.get('planetary.marketplace.offer.created-notif').subscribe((translated: string) => {
            this.translations.set('planetary.marketplace.offer.created-notif', translated);
        });
        this.subscriptions.push(sub);

        this.translations.set('planetary.marketplace.offer.offer-taken', 'planetary.marketplace.offer.offer-taken');
        sub = this.translate.get('planetary.marketplace.offer.offer-taken').subscribe((translated: string) => {
            this.translations.set('planetary.marketplace.offer.offer-taken', translated);
        });
        this.subscriptions.push(sub);

        this.setUpTradableResources();

        this.fetchOffers();
        if (!this.credits) {
            throw new Error("Yes but no. Repair me.")
        }
    }

    ngAfterViewInit() {
        this.setDatasource();
    }

    private setDatasource() {
        this.dataSource.data = this.tradeOffers;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;

        this.dataSource.sortingDataAccessor = (item, property) => {
            switch (property.toLocaleLowerCase()) {
                case "amount":
                    return item.trade.resourceAmount.amount;
                case "price":
                    return item.trade.pricePerUnit * item.trade.resourceAmount.amount;
                case "ppu":
                default:
                    return item.trade.pricePerUnit;
            }
        };
        this.resourceTypeChipList._chips.forEach(chip => chip.select());
        this.change.detectChanges();
    }

    private setUpTradableResources() {
        this.credits = this.typeService.collectableResourceTypes.filter(rt => rt.typeName === EResourceTypeEnum.CREDITS)[0];
        this.tradableResourceTypes = this.typeService.collectableResourceTypes.filter(r => r.typeName != this.credits.typeName);
        this.thePrice = {amount: 0, resourceType: this.credits};
        this.theTotal = {amount: 0, resourceType: this.credits};
    }

    private fetchOffers() {
        let sub = this.marketService.getOffers().subscribe(resp => {
            this.tradeOffers = resp;
            this.setDatasource();
        });
        this.subscriptions.push(sub);
    }

    setResourceTypesToFilterOffers() {
        const selectedResourceTypes: string[] = this.getStringArrayFromMatChips(this.resourceTypeChipList!.selected);
        this.selectedResourceTypes = this.tradableResourceTypes.filter(rt => selectedResourceTypes.includes(rt.typeName));

        this.dataSource.filter = selectedResourceTypes.join("-").trim().toLowerCase();
        this.dataSource.filterPredicate = function (data, filter: string): boolean {
            const split = filter.split("-");
            return split.includes(data.trade.resourceAmount.resourceType.typeName.toLowerCase());
        };

        if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage();
        }
    }

    private getStringArrayFromMatChips(MatChipListbox: MatChip[] | MatChip): string[] {
        const selectedResourceTypes: string[] = [];
        if (MatChipListbox instanceof Array) {
            MatChipListbox.forEach(chip => selectedResourceTypes.push(chip.value));
        } else {
            selectedResourceTypes.push(MatChipListbox.value);
        }
        return selectedResourceTypes;
    }

    takeOffer(idTradeOffer: number) {
        let sub = this.marketService.takeOffer({idTradeOffer: idTradeOffer, idDestination: this.planet!.idPlanet}).subscribe(() => {
            this.notif.open(this.translations.get('planetary.marketplace.offer.offer-taken')!)
        });
        this.subscriptions.push(sub);
        this.plantNotifService.fireOfferCrated();
    }

    displayOfferCreation(resource: ResourceAmount, trigger: CdkOverlayOrigin) {
        this.triggerCreateOffer = trigger;
        this.resourceToOffer = resource;
        this.isOpenCreateOffer = !this.isOpenCreateOffer;
    }

    closeOfferCreation() {
        this.isOpenCreateOffer = false;
        this.triggerCreateOffer = undefined;

        this.isOpenEditOffer = false;
        this.triggerEditOffer = undefined;

        this.resourceToOffer = undefined;
        this.theOffer = undefined;
        this.thePrice.amount = 0;
        this.theTotal.amount = 0;
        this.idTradeOfferToEdit = undefined;
    }

    createOffer() {
        if (!!this.thePrice && !!this.resourceToOffer && !!this.theOffer && this.theOffer.amount <= this.resourceToOffer.amount) {
            const offer: TradeOffer = {
                trade: {
                    resourceAmount: this.theOffer,
                    pricePerUnit: this.thePrice.amount
                },
                origin: {
                    id: this.planet!.idPlanet,
                    name: this.planet!.name
                }
            }
            if (!!this.idTradeOfferToEdit) {
                // we are editing an offer
                offer.idTradeOffer = this.idTradeOfferToEdit;
            }
            let sub = this.marketService.setOffer(offer).subscribe(() => {
                this.notif.short(this.translations.get('planetary.marketplace.offer.created-notif')!);
                this.closeOfferCreation();
                this.fetchOffers();
                this.plantNotifService.fireOfferCrated();
                this.closeOfferCreation();
            });
            this.subscriptions.push(sub);
        }
    }

    setOffer(event: ResourceAmount) {
        this.theOffer = event;
        this.calcTotal();
    }

    setPrice(event: number) {
        this.thePrice.amount = event;
        this.calcTotal();
    }

    calcTotal() {
        let price = 0;
        if (!!this.theOffer && !!this.thePrice) {
            price = this.thePrice.amount * this.theOffer.amount;
        }
        this.theTotal.amount = price;
    }

    editOffer(element: TradeOffer, trigger: CdkOverlayOrigin) {
        this.idTradeOfferToEdit = element.idTradeOffer;
        this.triggerEditOffer = trigger;
        this.isOpenEditOffer = !this.isOpenEditOffer;
        const resourceAmount = this.resourceDeposit.filter(r => r.resourceType.typeName === element.trade.resourceAmount.resourceType.typeName)[0];
        this.resourceToOffer = {resourceType: resourceAmount.resourceType, amount: resourceAmount.amount}
        this.theOffer = element.trade.resourceAmount;
        this.thePrice.amount = element.trade.pricePerUnit;
        this.calcTotal();
    }
}
