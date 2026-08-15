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
//mirrors the page size the filter endpoint applies. a short page is the only reliable
//end-of-results signal: the api returns a cursor for every page, including the last one,
//so the cursor alone never goes falsy and can't be used to detect exhaustion.
const LOCATIONS_PAGE_SIZE = 10;
interface fetcherParam {
    filterState: FilterParams,
    setFilterState: Function
}

function buildFilterUrl(filterUrlObject: any, cursor?: string): string {
  const params = new URLSearchParams();
  params.set('filter', JSON.stringify(filterUrlObject.filter));
  params.set('mapFilter', JSON.stringify(filterUrlObject.mapFilter));
  if (filterUrlObject.sort) params.set('sort', JSON.stringify(filterUrlObject.sort));
  if (cursor) params.set('cursor', cursor);
  return '/api/filter/locations?' + params.toString();
}

function useLocationsFetcher({filterState, setFilterState}: fetcherParam): LocationsFetch {
  let [locations, setLocations] = useState<Location[]>([]);
  let [unpaginatedLocations, setUnpaginatedLocations] = useState<any[]>([]);
  let [noMoreLocations, setNoMoreLocations] = useState<boolean>(false);
  let [cursor, setCursor] = useState<string>(null);
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
      if (noMoreLocations || locations.length === 0 || !cursor) {
          return;
      }
      const url = buildFilterUrl(filterState?.filterUrlObject, cursor);
      let filteredFetch = await fetch(url);
      let filtered = await filteredFetch.json() as any;
      let newLocs = (filtered.locations || []).filter(x => !locations.find(y => y.id === x.id));
      locations = locations.concat(newLocs.map(x => new Location(x)));
      setLocations(locations);
      setCursor(filtered.cursor || null);
      if (!filtered.cursor || newLocs.length === 0 || (filtered.locations || []).length < LOCATIONS_PAGE_SIZE) {
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
      setCursor(null);
      setFilterState((current) => {
        let newFilters: FilterParams = new FilterParams(current);
        newFilters.page = 1;
        localStorage.setItem('filters', JSON.stringify(newFilters));

        return newFilters;
      });
      filterState.page = 1;
      if (reloadTimeout) {
        window.clearTimeout(reloadTimeout);
      }

      let filterTimeout = filterState.searchFilter !== prevFilters?.searchFilter ? 500 : 200;
      reloadTimeout = window.setTimeout(async () => {
        const url = buildFilterUrl(filterState?.filterUrlObject);
        let filteredFetch = await fetch(url);
        let filtered = await filteredFetch.json() as any;
        locations = (filtered.locations || []).map(x => new Location(x));
        setLocations(locations);
        //null mapLocations means "you already hold the full map set", not "the set is empty".
        //this path never sends a cursor so it should always be populated, but don't wipe the
        //markers if that ever stops being true.
        if (filtered.mapLocations) {
          setUnpaginatedLocations(filtered.mapLocations);
        }
        setCursor(filtered.cursor || null);
        //a result set shorter than a full page means there is nothing after it. without this
        //the loader stayed visible forever on any small result set: the cursor kept hasMore
        //true, and too few results to scroll meant InfiniteScroll never fired next() to
        //discover the end.
        if (!filtered.cursor || locations.length < LOCATIONS_PAGE_SIZE) {
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