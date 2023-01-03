import dayjs from 'dayjs';
import minMax from 'dayjs/plugin/minMax';
dayjs.extend(minMax)

export function getNumberFromString(string) {
    return Number(string.replace(/[^0-9]/g, ''));
}

export function sortNumbers(a, b) {
    return a - b;
}

export function intersectDateRanges(ranges) {
    // debugger;
    if (ranges.length === 0) return false;
    if (ranges.length === 1) return ranges[0];
    if (ranges.length === 2) {
        let max = dayjs.max(dayjs(ranges[0].start), dayjs(ranges[1].start));
        let min = dayjs.min(dayjs(ranges[0].end), dayjs(ranges[1].end));
        if (max.isAfter(min)) { return false; }
        else {
            return {
                start: max,
                end: min
            }
        }
    }
}