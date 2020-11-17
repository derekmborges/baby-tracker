export interface Feeding {
    id?: string;
    type: FeedingType,
    breastDetails?: BreastDetails,
    bottleDetails?: BottleDetails;
    time: Date;
}

export enum FeedingType {
    Breast = 'breast',
    Bottle = 'bottle'
}

export interface BreastDetails {
    left: boolean,
    leftRating?: string,
    right: boolean,
    rightRating?: string,
}

export interface BottleDetails {
    ounces: number
}
