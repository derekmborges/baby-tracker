import * as moment from 'moment';

export function isToday(date: Date): boolean {
    return moment(date).dayOfYear() === moment().dayOfYear();
}

export function isYesterday(date: Date): boolean {
    return moment(date).dayOfYear() === moment().dayOfYear() - 1;
}

export function isThisWeek(date: Date): boolean {
    return moment(date).week() === moment().week();
}
