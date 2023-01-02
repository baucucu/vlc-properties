import dayjs from 'dayjs';

export function getNumberFromString(string) {
    return Number(string.replace(/[^0-9]/g, ''));
}

export function sortNumbers(a, b) {
    return a - b;
}

export function intersectDateRanges(ranges) {

    ranges = ranges.sort((a, b) => {
        return dayjs(a.start).isBefore(dayjs(b.start));
    });

}