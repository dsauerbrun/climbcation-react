import React, {createContext, useContext, useEffect, useState} from 'react';
import { filterHook } from './useFilterParams';
import { FilterContext } from './Home';

function LocationTilesContainer() {
    let {filterState, setFilterState, addCount} = useContext<filterHook>(FilterContext);

    let [locations, setLocations] = useState<any[]>([]);
	useEffect(() => {
        async function reloadLocations() {
            console.log('using effect, filter state', filterState);
            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(filterState?.filterUrlObject)
             
            };
            let filteredFetch = await fetch('/api/filter_locations', requestOptions);
            let filtered = await filteredFetch.json() as any
            console.log(filtered);
            setLocations(filtered.paginated);
        }

        reloadLocations();
	}, [filterState]);

   return (
        <pre>{JSON.stringify(locations)}</pre>
   );
}

export default LocationTilesContainer;