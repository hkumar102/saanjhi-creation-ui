import { inject, Pipe, PipeTransform } from '@angular/core';
import { AvailableColors } from '../constants';
import { ColorsService } from '../services';

@Pipe({
    name: 'colorCode',
    standalone: true
})
export class ColorCodePipe implements PipeTransform {

    private colorService = inject(ColorsService);

    constructor() {
        this.colorService.colors$.subscribe(colors => {
            this.colorMap = colors;
        });
    }
    private colorMap = AvailableColors;

    transform(color: string): string {
        return this.colorMap.find(c => c.name === color)?.code || '#ddd'; // fallback
    }
}