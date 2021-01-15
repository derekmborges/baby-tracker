export interface Feeding {
    id?: string;
    type: FeedingType,
    breastDetails?: BreastDetails,
    bottleDetails?: BottleDetails;
    time: Date;
}

export enum FeedingType {
    Breast = 'breast',
    Bottle = 'bottle',
    Solids = 'solids'
}

export interface BreastDetails {
    left: boolean,
    leftMinutes: string,
    leftSeconds: string,
    right: boolean,
    rightMinutes: string,
    rightSeconds: string,
    lastBreast: string
}

export interface BottleDetails {
    ounces: number
}
