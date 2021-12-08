/* eslint-disable react-hooks/exhaustive-deps */
import {useState, useEffect} from 'react';
import { FilterParams } from '../classes/FilterParams';
import axios from 'axios';
import { animateScroll } from "react-scroll";
import { useForceUpdate } from '../common/useForceUpdate';
import Location from '../classes/Location';
import { airport, allAirports } from '../common/airportsList';
import {usePrevious} from '../common/HelperComponents';

export interface LocationsFetch {
    nextLocations?: any,
    locations?: any[],
    noMoreLocations?: boolean,
    unpaginatedLocations?: any[],
    addSingleLocation?: Function,
    selectedAirport?: airport,
    setSelectedAirport?: Function,
}

let reloadTimeout: number = null;
interface fetcherParam {
    filterState: FilterParams,
    setFilterState: Function
}

function useLocationsFetcher({filterState, setFilterState}: fetcherParam): LocationsFetch {
  let [locations, setLocations] = useState<Location[]>([]);
  let [unpaginatedLocations, setUnpaginatedLocations] = useState<any[]>([]);
  let [noMoreLocations, setNoMoreLocations] = useState<boolean>(false);
	let storedIataCode = localStorage.getItem('airport') &&  localStorage.getItem('airport') !== 'null' ? JSON.parse(localStorage.getItem('airport'))?.iata_code : 'DEN';
	let [selectedAirport, setSelectedAirport] = useState<airport>(allAirports.find(x => x.iata_code === storedIataCode) || allAirports[0]);
  let forceUpdate = useForceUpdate();

  let getFlightQuotes = async (slugs: string[], originAirportCode: string) => {
      return axios.post('/api/collect_locations_quotes', {slugs: slugs, origin_airport: originAirportCode}).then(function(response){
          let flightQuotes = response.data;
          locations.filter(x => slugs.includes(x.slug)).forEach(location => {
              let locationQuote = flightQuotes.find(x => x.id === location.id);
              location.flightPrice = locationQuote;
              location.referral = locationQuote?.referral;
          });
          forceUpdate();
  });
  }

  async function nextLocations() {
      if (noMoreLocations || locations.length === 0) {
          return;
      }
      setFilterState((current) => {
          let newFilters: FilterParams = new FilterParams(current);
          newFilters.page = newFilters.page + 1;

          return newFilters;
      });
      filterState.page = filterState.page + 1;
      let objectBody = {...filterState?.filterUrlObject};
      const requestOptions = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(objectBody)
          
      };
      let filteredFetch = await fetch('/api/filter_locations', requestOptions);
      let filtered = await filteredFetch.json() as any
      filtered.paginated = filtered.paginated.filter(x => !locations.find(y => y.id === x.id));
      // getFlightQuotes(filtered.paginated.map(x => x.slug), selectedAirport?.iata_code);
      locations = locations.concat(filtered.paginated.map(x => new Location(x)));
      setLocations(locations);
      if (filtered.paginated.length === 0) {
          setNoMoreLocations(true);
      }
  }

  useEffect(() => {
      // getFlightQuotes(locations.map(x => x.slug), selectedAirport?.iata_code);
  }, [selectedAirport])
  
  let prevFilters: FilterParams = usePrevious(filterState);
  useEffect(() => {
    async function reloadLocations() {
      setLocations([]);
      setNoMoreLocations(false);
      setFilterState((current) => {
        let newFilters: FilterParams = new FilterParams(current);
        newFilters.page = 1;
        localStorage.setItem('filters', JSON.stringify(newFilters));

        return newFilters;
      });
      filterState.page = 1;
      let objectBody = {...filterState?.filterUrlObject};
      const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(objectBody)
      };
      if (reloadTimeout) {
        window.clearTimeout(reloadTimeout);
      }

      let filterTimeout = filterState.searchFilter !== prevFilters?.searchFilter ? 500 : 200;
      reloadTimeout = window.setTimeout(async () => {
        let filteredFetch = await fetch('/api/filter_locations', requestOptions);
        let filtered = await filteredFetch.json() as any
        locations = filtered.paginated.map(x => new Location(x));
        // getFlightQuotes(locations.map(x => x.slug), 'LAX');
        setLocations(locations);
        setUnpaginatedLocations(filtered.unpaginated);
        if (filtered.paginated.length === 0) { 
          setNoMoreLocations(true);
        }
      }, filterTimeout);            
    }

    reloadLocations();
// eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterState.filterChangedChecker]);

  let addSingleLocation = (location) => {
    var exists = locations?.find(function(locationIter) {
      return locationIter.id === location.id;
    });
    if (!exists) {
      axios.get('/api/location/' + location.slug).then(function(resp) {
        let newLocation = resp.data.location;
          locations?.unshift(new Location(newLocation));
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
  return {nextLocations, addSingleLocation, locations, noMoreLocations, unpaginatedLocations, selectedAirport, setSelectedAirport};
}

export default useLocationsFetcher;