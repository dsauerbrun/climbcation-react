import {useState, useEffect} from 'react';
import { FilterParams } from '../classes/FilterParams';
import axios from 'axios';
import { animateScroll } from "react-scroll";
import { useForceUpdate } from '../common/useForceUpdate';

export interface LocationsFetch {
    nextLocations?: any,
    locations?: any[],
    noMoreLocations?: boolean,
    unpaginatedLocations?: any[],
    addSingleLocation?: Function,
}

let reloadTimeout: number = null;
interface fetcherParam {
    filterState: FilterParams,
    setFilterState: Function
}

function useLocationsFetcher({filterState, setFilterState}: fetcherParam): LocationsFetch {
    let [locations, setLocations] = useState<any[]>([]);
    let [unpaginatedLocations, setUnpaginatedLocations] = useState<any[]>([]);
    let [noMoreLocations, setNoMoreLocations] = useState<boolean>(false);

    async function nextLocations() {
        if (noMoreLocations || locations.length === 0) {
            return;
        }
        let newFilters: FilterParams = new FilterParams(filterState);
        newFilters.page = newFilters.page + 1;
        setFilterState(newFilters);
        let objectBody = {...newFilters?.filterUrlObject};
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(objectBody)
            
        };
        let filteredFetch = await fetch('/api/filter_locations', requestOptions);
        let filtered = await filteredFetch.json() as any
        filtered.paginated = filtered.paginated.filter(x => !locations.find(y => y.id === x.id));
        locations = locations.concat(filtered.paginated);
        setLocations(locations);
        if (filtered.paginated.length === 0) {
            setNoMoreLocations(true);
        }
    }
   
    useEffect(() => {
        async function reloadLocations() {
            setLocations([]);
            setNoMoreLocations(false);
            let newFilters: FilterParams = new FilterParams(filterState);
            newFilters.page = 1;
            setFilterState(newFilters);
            let objectBody = {...filterState?.filterUrlObject};
            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(objectBody)
                
            };
            if (reloadTimeout) {
                window.clearTimeout(reloadTimeout);
            }
            reloadTimeout = window.setTimeout(async () => {
                let filteredFetch = await fetch('/api/filter_locations', requestOptions);
                let filtered = await filteredFetch.json() as any
                setLocations(filtered.paginated);
                setUnpaginatedLocations(filtered.unpaginated);
                /*let nonExistentUnpaginated = filtered.unpaginated.filter((x: any) => !unpaginatedLocations.find( y => y.id === x.id));
                if (nonExistentUnpaginated.length > 0) {
                    setUnpaginatedLocations(unpaginatedLocations.concat(nonExistentUnpaginated));
                }*/
                if (filtered.paginated.length === 0) { 
                    setNoMoreLocations(true);
                }
            }, 200);            
        }

        reloadLocations();
	// eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filterState.filterChangedChecker]);

    let forceUpdate = useForceUpdate();

    let addSingleLocation = (location) => {
            var exists = locations?.find(function(locationIter) {
                return locationIter.id === location.id;
            });
            if (!exists) {
                axios.get('/api/location/' + location.slug).then(function(resp) {
                    let newLocation = resp.data.location;
                        locations?.unshift(newLocation);
                        setLocations(locations);
                        animateScroll.scrollToTop({
                            containerId: "locations-window"
                        });
                        forceUpdate();
                    }
                );
            } else {
                locations = locations.filter(x => x.id !== exists.id);
                locations?.unshift(exists);
                setLocations(locations);
                animateScroll.scrollToTop({
                    containerId: "locations-window"
                });
                forceUpdate();
            }
    }
    return {nextLocations, addSingleLocation, locations, noMoreLocations, unpaginatedLocations};
}

export default useLocationsFetcher;