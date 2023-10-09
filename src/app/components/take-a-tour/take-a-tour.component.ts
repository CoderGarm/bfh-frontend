import {Component, ElementRef, ViewChild} from '@angular/core';
import KeenSlider, {KeenSliderInstance} from 'keen-slider'
import {NgxSpinnerService} from "ngx-spinner";
import {BreakpointObserver, Breakpoints} from "@angular/cdk/layout";

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
export class TakeATourComponent {

    static path: string = 'take-a-tour';

    @ViewChild("sliderRef")
    sliderRef?: ElementRef<HTMLElement>

    slider?: KeenSliderInstance;

    currentSlide: number = 0;
    dotHelper: number[] = [];

    imgSrc: string = '';
    imgAlt: string = '';

    maxWidth?: string;
    maxHeight?: number;

    constructor(private breakpointObserver: BreakpointObserver,
                protected spinner: NgxSpinnerService) {

        this.breakpointObserver.observe(Breakpoints.Handset).subscribe(result => {
            console.log(result.breakpoints);
            if (result.matches) {
                this.maxWidth = 800 + 'px;';
            }
            console.log(this.maxWidth, this.maxHeight) /* fixme how to clear that fuckin topic with da woo wide screen? */
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
