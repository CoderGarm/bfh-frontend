import {Component, ElementRef, ViewChild} from '@angular/core';
import KeenSlider, {KeenSliderInstance} from "keen-slider";

const WheelControls = (slider: any) => {
    let touchTimeout: string | number | NodeJS.Timeout | undefined
    let position: any
    let wheelActive: any

    function dispatch(e: any, name: string) {
        console.log("dispatch", name)
        position.x -= e.deltaX
        position.y -= e.deltaY
        slider.container.dispatchEvent(
            new CustomEvent(name, {
                detail: {
                    x: position.x,
                    y: position.y,
                },
            })
        )
    }

    function wheelStart(e: any) {
        position = {
            x: e.pageX,
            y: e.pageY,
        }
        dispatch(e, "ksDragStart")
    }

    function wheel(e: any) {
        dispatch(e, "ksDrag")
    }

    function wheelEnd(e: any) {
        dispatch(e, "ksDragEnd")
    }

    function eventWheel(e: any) {
        e.preventDefault()
        console.log("wheelActive", wheelActive)

        wheelStart(e)
        wheel(e)
        wheel(e)
        wheelEnd(e)


        /*if (!wheelActive) {
            wheelStart(e)
            wheelActive = true
        }
        wheel(e)
        clearTimeout(touchTimeout)
        touchTimeout = setTimeout(() => {
            wheelActive = false
            wheelEnd(e)
        }, 50)*/
    }

    slider.on("created", () => {
        slider.container.addEventListener("wheel", eventWheel, {
            passive: false,
        })
    })
}

@Component({
    selector: 'app-slider-wheel',
    templateUrl: './slider-wheel.component.html',
    styleUrls: [
        './slider-wheel.component.scss',
        "./../../../../styles/keen-slider/keen-slider.min.css",
        "./../../../../styles/keen-slider/keen-slider.css",
        "./../../../../styles/keen-slider/keen-slider.scss"
    ]
})
export class SliderWheelComponent {
    @ViewChild("sliderRef") sliderRef?: ElementRef<HTMLElement>

    slider?: KeenSliderInstance

    ngAfterViewInit() {
        this.slider = new KeenSlider(
            this.sliderRef!.nativeElement,
            {
                loop: true,
                rubberband: false,
                vertical: true,
            },
            [WheelControls]
        )
    }

    ngOnDestroy() {
        if (this.slider) this.slider.destroy()
    }
}
