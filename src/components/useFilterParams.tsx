import {useState, useEffect} from 'react';
import {FilterParams} from '../classes/FilterParams';

export interface filterHook {
	filterState?: FilterParams | null,
	setFilterState?(FilterParams: FilterParams | Function): void
}

function useFilterParams() {
	let localstorageFilters = localStorage.getItem('filters') ? JSON.parse(localStorage.getItem('filters')) : {};
	let [filterState, setFilterState] = useState<FilterParams>(new FilterParams(localstorageFilters));

	return {filterState, setFilterState};
}

export default useFilterParams;