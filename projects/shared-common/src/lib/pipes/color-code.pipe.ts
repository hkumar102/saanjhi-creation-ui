import { Pipe, PipeTransform } from '@angular/core';
import { AvailableColors } from '../constants';

@Pipe({
    name: 'colorCode',
    standalone: true
})
export class ColorCodePipe implements PipeTransform {
    private readonly colorMap = AvailableColors;

    transform(color: string): string {
        return this.colorMap.find(c => c.name === color)?.code || '#ddd'; // fallback
    }
}