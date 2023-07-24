import {Component, ElementRef, ViewChild} from '@angular/core';
import KeenSlider, {KeenSliderInstance} from 'keen-slider'
import {NgxSpinnerService} from "ngx-spinner";

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

    constructor(protected spinner: NgxSpinnerService) {
    }

    ngAfterViewInit() {
        setTimeout(() => {
            this.slider = new KeenSlider(this.sliderRef!.nativeElement, {
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
