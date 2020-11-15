import * as moment from 'moment';

/*
 * Boolean Validators
*/

export function isToday(date: Date): boolean {
    return moment(date).dayOfYear() === moment().dayOfYear();
}

export function isYesterday(date: Date): boolean {
    return moment(date).dayOfYear() === moment().dayOfYear() - 1;
}

export function isWithinWeek(date: Date): boolean {
    const sixDaysAgo = moment().subtract(6, 'days');
    console.log(`${formatDateString(date)} within week: ${moment.duration(moment(date).diff(sixDaysAgo)).days()}`);
    return moment.duration(moment(date).diff(sixDaysAgo)).days() <= 6;
}


/*
 *  Formatters
*/

export function formatTimeString(date: Date): string {
    return moment(date).format('h:mm A');
}

export function formatDateString(date: Date): string {
    return moment(date).format('MM/D/YYYY');
}

export function formatDayString(date: Date): string {
    return moment(date).format('dddd');
}
