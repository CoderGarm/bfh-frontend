import {Component, ElementRef, ViewChild} from '@angular/core';
import KeenSlider, {KeenSliderInstance} from 'keen-slider'

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

    ngAfterViewInit() {
        this.slider = new KeenSlider(this.sliderRef!.nativeElement!, {
            loop: true,
        })
    }

    ngOnDestroy() {
        if (this.slider) this.slider.destroy()
    }
}
