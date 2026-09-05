import { useState, useEffect } from 'react';
import axios from 'axios';
import { Accommodation, FoodOption, Transportation, Grade, ClimbingType } from '../classes/Location';

export interface AccommodationOption extends Accommodation {
	ranges: string[];
}

export interface FoodOptionOption extends FoodOption {
	ranges: string[];
}

export interface TransportationOption extends Transportation {
	ranges: string[];
}

export interface Month {
	id: number;
	name: string;
	numericalValue: number;
}

//get_attribute_options returns the climbing type display name under climbingType rather than name,
//unlike the location and filter payloads which use name. this split is intentional and permanent per
//the backend, not a bug awaiting a fix, so normalize it here and let the rest of the app read name.
//the grades on this endpoint are deliberately flat (climbingType/climbingTypeId) where those other
//two payloads nest type:{id,name,url} — that one is consumed as-is, no normalization.
function normalizeClimbingTypes(climbingTypes: any[]): ClimbingType[] {
	return climbingTypes?.map(climbingType => ({...climbingType, name: climbingType.name ?? climbingType.climbingType}));
}


export function useEditables() {
	interface AttributeOptions {
		accommodations?: AccommodationOption[];
		foodOptions?: FoodOptionOption[];
		transportations?: TransportationOption[];
		grades?: Grade[];
		months?: Month[];
		climbingTypes?: ClimbingType[];
	}
	let [editables, setEditables] = useState<AttributeOptions>({});
	let populateEditables = () => {
		axios.get('/api/get_attribute_options').then(function(data){
			var respData = data.data
			setEditables({climbingTypes: normalizeClimbingTypes(respData.climbingTypes), months: respData.months, grades: respData.grades, accommodations: respData.accommodations, foodOptions: respData.foodOptions, transportations: respData.transportations})
		});
    }
    
    useEffect(() => {
        populateEditables();
    }, [])
    
    return editables;
}