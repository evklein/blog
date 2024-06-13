export function getReadableTimespanString(fromDateString: string) {
    let fromDate = new Date(fromDateString);
    let toDate = new Date();
    let timeBetweenInSeconds = Math.abs(toDate.getTime() - fromDate.getTime()) / 1000;

    let secondsInAMinute = 60;
    let secondsInAnHour = 60 * secondsInAMinute;
    let secondsInADay = 24 * secondsInAnHour;
    let secondsInAMonth = 30 * secondsInADay;
    let secondsInAYear = 12 * secondsInAMonth;

    if (timeBetweenInSeconds < secondsInAMinute) return "less than a minute ago";
    if (timeBetweenInSeconds < secondsInAnHour) return `${finalizeReadableTimespanString(Math.floor(timeBetweenInSeconds / secondsInAMinute), "minute")}`;
    if (timeBetweenInSeconds < secondsInADay) return `${finalizeReadableTimespanString(Math.floor(timeBetweenInSeconds / secondsInAnHour), "hour")}`;
    if (timeBetweenInSeconds < secondsInAMonth) return `${finalizeReadableTimespanString(Math.floor(timeBetweenInSeconds / secondsInADay), "day")}`;
    if (timeBetweenInSeconds < secondsInAYear) return `${finalizeReadableTimespanString(Math.floor(timeBetweenInSeconds / secondsInAMonth), "month")}`;
    else return "A long time ago";
}

function finalizeReadableTimespanString(displayNumber: number, timeIncrement: string) {
    return `${displayNumber} ${timeIncrement}${displayNumber > 1 ? 's' : ''} ago`
}