import {Component, OnInit} from "@angular/core";
import {CommonModule} from "@angular/common";
import {ProgressSpinnerModule} from "primeng/progressspinner";
import {LoaderService} from "../../../service/loader.service";

@Component({
    selector: 'app-loading-indicator',
    template: `
        <div *ngIf="showLoading">
            <div class="loading-indicator-modal"></div>
            <div class="loading-indicator">
                <p-progressSpinner></p-progressSpinner>
            </div>
        </div>
    `,
    imports: [CommonModule, ProgressSpinnerModule],
    standalone: true,
    styles: [
        `
            .loading-indicator-modal {
                background-color: black;
                position: fixed;
                width: 100%;
                top: 0;
                left: 0;
                height: 100%;
                z-index: 1998;
                opacity: 0.05;
            }

            .loading-indicator {
                position: fixed;
                width: 100%;
                top: 0;
                left: 0;
                height: 100%;
                align-items: center;
                justify-content: center;
                display: grid;
                z-index: 1999;
            }
        `,
    ],
})
export class LoadingIndicatorComponent implements OnInit {
    /** Folyamatban van-e betöltés? */
    loading = false;

    /** Látható legyen-e a betöltés jelző? */
    showLoading = false;

    /** A setTimout azonosítója a megjelenítés késleltetéséhez. */
    timeout?: number;

    constructor(private loaderService: LoaderService) {
    }

    ngOnInit(): void {
        this.loaderService.loading.subscribe(this.onLoadingChange);
    }

    showLoadingIndicator = () => {
        this.showLoading = true;
    };

    onLoadingChange = (v: any) => {
        this.loading = v;

        if (this.timeout) {
            clearTimeout(this.timeout);
        }

        if (this.loading) {
            this.timeout = window.window.setTimeout(this.showLoadingIndicator, 100);
        } else {
            this.showLoading = false;
        }
    };
}
