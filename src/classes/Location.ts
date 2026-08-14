export interface ClimbingType {
    name: string;
    url: string;
    type?: string;
    id: number;
    //get_attribute_options returns the display name here instead of name.
    //useEditables normalizes it onto name.
    climbingType?: string;
}

export interface Grade {
    grade: string;
    id: number;
    //nested on the location and filter payloads only
    type?: any;
    //flat on get_attribute_options only, where type is absent. this split is intentional per the
    //backend, so read climbingTypeId when the grade came from useEditables and type.id otherwise.
    order?: number;
    climbingType?: string;
    climbingTypeId?: number;
}

interface FlightPrice {
    airport_code: string;
    id: number;
    origin_airport: string;
    quotes: any;
    referral: string;
    slug: string;
}

interface HasThumbUrls {
    homeThumbUrl?: string | null;
    legacyHomeThumbUrl?: string | null;
}

//legacy first: every record predating the bun admin uploader only resolves through the
//paperclip-style legacy path. swaps to homeThumbUrl-first once the uploader key mismatch is fixed
//backend side, so the fallback stays either way. takes a plain object rather than using the Location
//getter, since nearby locations come through as plain objects that carry the same url pair.
export function getHomeThumb(location: HasThumbUrls): string | null {
    return location?.legacyHomeThumbUrl || location?.homeThumbUrl || null;
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
    homeThumbUrl: string | null = null;
    legacyHomeThumbUrl: string | null = null;
    country: string | null = null;
    climbingTypes: ClimbingType[] = [];
    dateRange: string | null = null;
    grades: Grade[] = [];
    walkingDistance: boolean | null = null;
    closestAccommodation: string | null = null;
    rating: number = 0;
    soloFriendly: boolean | null = null;
    airportCode: string = 'DEN';
    flightPrice: FlightPrice = null;
    referral: string | null = null;
    latitude: number;
    longitude: number;
    savingMoneyTips: string;
    isPrimary: boolean = false;

    commonExpensesNotes: string = null;
    continent: string = null;


    nearby: any[] = null;
    //absent from the payload when no transportation has a cost
    bestTransportation: Transportation = null;
    transportations: Transportation[] = [];
    gettingInNotes: string = null;
    accommodationNotes: string = null;
    accommodations: Accommodation[] = [];
    active: boolean;
    foodOptions: FoodOption[] = [];
    miscSections: MiscSection[] = [];

    constructor(locationObj: any) {
        Object.assign(this, locationObj);
        this.id = locationObj.id;
        this.name = locationObj.name;
        this.slug = locationObj.slug;
        this.homeThumbUrl = locationObj.homeThumbUrl;
        this.legacyHomeThumbUrl = locationObj.legacyHomeThumbUrl;
        this.country = locationObj.country;
        this.climbingTypes = locationObj.climbingTypes;
        this.dateRange = locationObj.dateRange;
        this.grades = locationObj.grades;
        this.walkingDistance = locationObj.walkingDistance;
        this.closestAccommodation = locationObj.closestAccommodation;
        this.rating = locationObj.rating;
        this.soloFriendly = locationObj.soloFriendly;
        this.airportCode = locationObj.airportCode;
        this.bestTransportation = locationObj.bestTransportation;
        this.transportations = locationObj.transportations;
        this.gettingInNotes = locationObj.gettingInNotes;
    }

    get homeThumb(): string | null {
        return getHomeThumb(this);
    }

    ratingName() {
        return getRatingName(this.rating);
    }

    noCarNeeded() {
        return this.walkingDistance && (this.closestAccommodation === '<1 mile' || this.closestAccommodation === '1-2 miles')
    }

    get lowestPrice() {
        return {cost: 100000, date: '2021-01-02'};
    }


}