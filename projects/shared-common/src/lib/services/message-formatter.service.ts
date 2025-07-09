import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class MessageFormatterService {
    /**
     * Formats a string by replacing placeholders like {0}, {1}, etc.
     * @param template - The string with placeholders
     * @param args - The values to inject
     */
    format(template: string, ...args: any[]): string {
        return template.replace(/{(\d+)}/g, (match, index) =>
            typeof args[index] !== 'undefined' ? args[index] : match
        );
    }

    /**
    * Pluralizes a word based on a count.
    * Usage: pluralize('item', 1) => '1 item', pluralize('item', 3) => '3 items'
    */
    pluralize(word: string, count: number, pluralForm?: string): string {
        const plural = pluralForm || `${word}s`;
        return `${count} ${count === 1 ? word : plural}`;
    }

    /**
    * Resolves a label from a key/value map or returns the key.
    * Useful for enums or translation maps.
    */
    resolveLabel(key: string | number, map?: Record<string | number, string>): string {
        return (map && map[key]) || String(key);
    }
}