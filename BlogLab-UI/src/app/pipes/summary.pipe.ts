import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'summary',
})
export class SummaryPipe implements PipeTransform {
    transform(
        content: string | undefined,
        characterLimit: number
    ): string | undefined {
        if (!!content && content.length > characterLimit) {
            return `${content.substring(0, characterLimit)}...`;
        }
        return content;
    }
}
