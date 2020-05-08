interface climbingType {
    name: string;
    url: string;
    type: string;
    id: number;
}

interface grade {
    type: any;
    grade: string;
    id: number;
}

interface flightPrice {
    airport_code: string;
    id: number;
    origin_airport: string;
    quotes: any;
    referral: string;
    slug: string;
}

export function getRatingName(rating: number): string {
    if (rating === 1) {
        return 'Worth a Stop.';
    } else if (rating === 2) {
        return 'Worth a Detour.';
    } else if (rating === 3) {
        return 'Worth Its Own Trip.'
    } else {
        return '';
    }
}


export default class Location {
    name: string | null = null;
    slug: string | null = null;
    home_thumb: string | null = null;
    country: string | null = null;
    climbing_types: climbingType[] = [];
    date_range: string | null = null;
    grades: grade[] = [];
    walking_distance: boolean | null = null;
    closest_accommodation: string | null = null;
    rating: number = 0;
    solo_friendly: boolean | null = null;
    airport_code: string = 'DEN';
    flightPrice: flightPrice | null = null;
    referral: string | null = null;

    ratingName() {
        return getRatingName(this.rating);
    }

    noCarNeeded() {
        return this.walking_distance && (this.closest_accommodation === '<1 mile' || this.closest_accommodation === '1-2 miles')
    }

    get lowestPrice() {
        return {cost: 100000, date: '2021-01-02'};
    }


}