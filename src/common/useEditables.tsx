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
	number: number;
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
			setEditables({climbingTypes: respData.climbing_types, months: respData.months, grades: respData.grades, accommodations: respData.accommodations, foodOptions: respData.food_options, transportations: respData.transportations})
		});
    }
    
    useEffect(() => {
        populateEditables();
    }, [])
    
    return editables;
}