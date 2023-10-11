import {Component, ElementRef, ViewChild} from '@angular/core';
import KeenSlider, {KeenSliderInstance} from 'keen-slider'
import {NgxSpinnerService} from "ngx-spinner";
import {BreakpointObserver, Breakpoints} from "@angular/cdk/layout";
import {SubscriptionManager} from "../../subscription.manager";

@Component({
    selector: 'app-take-a-tour',
    templateUrl: './take-a-tour.component.html',
    styleUrls: [
        './take-a-tour.component.scss',
        "./../../../styles/keen-slider/keen-slider.min.css",
        "./../../../styles/keen-slider/keen-slider.css",
        "./../../../styles/keen-slider/keen-slider.scss"
    ]
})
export class TakeATourComponent extends SubscriptionManager {

    static path: string = 'take-a-tour';

    @ViewChild("sliderRef")
    sliderRef?: ElementRef<HTMLElement>

    slider?: KeenSliderInstance;

    currentSlide: number = 0;
    dotHelper: number[] = [];

    imgSrc: string = '';
    imgAlt: string = '';

    maxWidth?: string;

    constructor(private breakpointObserver: BreakpointObserver,
                protected spinner: NgxSpinnerService) {
        super();


        this.breakpointObserver.observe(Breakpoints.Handset).subscribe(result => {
            if (result.matches) {
                // todo I am an ugly hack - please repair me
                this.maxWidth = 800 + 'px;';
            }
        });
    }

    ngAfterViewInit() {
        setTimeout(() => {
            this.slider = new KeenSlider(this.sliderRef!.nativeElement, {
                loop: true,
                initial: this.currentSlide,
                slideChanged: (s) => {
                    this.currentSlide = s.track.details.rel
                },
            })
            this.dotHelper = [
                ...Array(this.slider.track.details.slides.length).keys(),
            ]
        })
    }

    ngOnDestroy() {
        if (this.slider) this.slider.destroy()
    }
}
