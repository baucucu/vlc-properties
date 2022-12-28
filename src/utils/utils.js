export function getNumberFromString(string) {
    return Number(string.replace(/[^0-9]/g, ''));
}

export function sortNumbers(a, b) {
    return a - b;
}