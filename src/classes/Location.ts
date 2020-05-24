interface ClimbingType {
    name: string;
    url: string;
    type?: string;
    id: number;
}

interface Grade {
    type: any;
    grade: string;
    id: number;
}

interface FlightPrice {
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

export interface Accommodation {
    cost: string;
    id: number;
    name: string;
    url: string;
}

export interface Transportation {
    cost?: string;
    id: number;
    name: string;
}

export interface FoodOption {
    cost: string;
    id: number;
    name: string;
}

export interface MiscSection {
    id?: number;
    title: string;
    body: string;
}

export default class Location {
    id: number;
    name: string | null = null;
    slug: string | null = null;
    home_thumb: string | null = null;
    country: string | null = null;
    climbing_types: ClimbingType[] = [];
    date_range: string | null = null;
    grades: Grade[] = [];
    walking_distance: boolean | null = null;
    closest_accommodation: string | null = null;
    rating: number = 0;
    solo_friendly: boolean | null = null;
    airport_code: string = 'DEN';
    flightPrice: FlightPrice | null = null;
    referral: string | null = null;
    latitude: number;
    longitude: number;
    saving_money_tips: string;
    isPrimary: boolean = false;

    common_expenses_notes: string = null;
    continent: string = null;
    

    nearby: any[] = null;
    best_transportation: Transportation = null;
    transportations: Transportation[] = [];
    getting_in_notes: string = null;
    accommodation_notes: string = null;
    accommodations: Accommodation[] = [];
    active: boolean;
    food_options: FoodOption[] = [];
    miscSections: MiscSection[] = [];

    constructor(locationObj: any) {
        Object.assign(this, locationObj);
        this.id = locationObj.id;
        this.name = locationObj.name;
        this.slug = locationObj.slug;
        this.home_thumb = locationObj.home_thumb;
        this.country = locationObj.country;
        this.climbing_types = locationObj.climbing_types;
        this.date_range = locationObj.date_range;
        this.grades = locationObj.grades;
        this.walking_distance = locationObj.walking_distance;
        this.closest_accommodation = locationObj.closest_accommodation;
        this.rating = locationObj.rating;
        this.solo_friendly = locationObj.solo_friendly;
        this.airport_code = locationObj.airport_code;
        this.best_transportation = locationObj.best_transportation;
        this.transportations = locationObj.transportations;
        this.getting_in_notes = locationObj.getting_in_notes;
    }

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