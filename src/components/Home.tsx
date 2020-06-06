import React, {createContext, useState, useContext, useEffect} from 'react';
import heroImageLeft from '../images/hero-image-left.png';
import heroImageRight from '../images/hero-image-right.png';
import skyscannerinline from '../images/skyscannerinline.png';
import Filter from './Filter';
import LocationTilesContainer from './LocationsTilesContainer';
import useFilterParams, {filterHook} from './useFilterParams';
import useLocationsFetcher, { LocationsFetch } from './useLocationsFetcher';
import { FilterParams, months } from '../classes/FilterParams';
import Map from './MapFilter';
import classNames from 'classnames';
import axios from 'axios';
import { animateScroll, scroller } from "react-scroll";

export const FilterContext = createContext<filterHook>({});
export const LocationsContext = createContext<LocationsFetch>({});

function Home() {
	let filterParamHook = useFilterParams();
	let locationsFetchHook = useLocationsFetcher(filterParamHook);
	let [largeMapEnabled, setLargeMapEnabled] = useState<boolean>(false);
	let [mobileFilterOpen, setMobileFilterOpen] = useState(false);
	let [mobileMapOpen, setMobileMapOpen] = useState(false);

	let [hoveredLocation, setHoveredLocation] = useState();

	const mapMoved = (map: google.maps.Map): void => {
		if (map) {
			let newFilters: FilterParams = new FilterParams(filterParamHook.filterState);
			let southWest = map.getBounds().getSouthWest();
			let northEast = map.getBounds().getNorthEast();
			let center = map.getCenter();
			newFilters.southWest = {lat: southWest.lat(), lng: southWest.lng() };
			newFilters.northEast = {lat: northEast.lat(), lng: northEast.lng()}; 
			newFilters.center = {lat: center.lat(), lng: center.lng()};
			newFilters.page = 1;
			filterParamHook.setFilterState(newFilters);
		}
	}

	let getNewMapProps = () => {
		return {
			longitude: filterParamHook.filterState.center.lng,
			latitude: filterParamHook.filterState.center.lat,
			zoom: filterParamHook.filterState.zoom,
			options: {
				center: filterParamHook.filterState.center,
				zoom: 2,
				mapTypeId: 'roadmap',
				id: 'mapFilterLarge',
				gestureHandling: 'greedy',
				scrollWheel: false
			},
			styles: {
				width: '58vw',
				height: '100%'
			},
			onDragEnd: mapMoved,
			onZoomChange: mapMoved,
			markers: locationsFetchHook.unpaginatedLocations,
			markerClickFunc: (location) => {
				locationsFetchHook.addSingleLocation(location);
			},
			onMount: null, className: null, onMountProps: null
		};
	}
	let mapProps = getNewMapProps();

	return (
		<FilterContext.Provider value={filterParamHook}>
        <LocationsContext.Provider value={locationsFetchHook}>
			<section>
				<img src={skyscannerinline} style={{display: 'none'}} alt=""/>
				<Hero filterHook={filterParamHook}/>
				<Filter largeMapEnabled={largeMapEnabled} setLargeMapEnabled={setLargeMapEnabled} hoveredLocation={hoveredLocation} mobileMapOpen={mobileMapOpen} setMobileMapOpen={setMobileMapOpen} mobileFilterOpen={mobileFilterOpen} setMobileFilterOpen={setMobileFilterOpen}/>
				<div className="row" style={{display: mobileMapOpen || mobileFilterOpen ? 'none' : ''}}>
					<div id="locations-window" className={classNames({'large-map': largeMapEnabled})}>
						<LocationTilesContainer airportCode={locationsFetchHook.selectedAirport?.iata_code} setHoveredLocation={setHoveredLocation} />
					</div>
					{largeMapEnabled && (<div>
						<Map {...mapProps} hoveredLocation={hoveredLocation}></Map>
					</div>)}
				</div>
			</section>
		</LocationsContext.Provider>
		</FilterContext.Provider>
	);
}

function Hero({filterHook}: {filterHook: filterHook}) {
	let climbTypes = [];

	let goToFilter = async (preset: string) => {
		let presets = {
			alpine: {climbingTypes: ['Alpine'], months: {start: 6, end: 9}, map: {zoom: 0, center: {lat: -3.745, lng: -38.523}, northeast: {longitude: 180, latitude: 90}, southwest: {longitude: -180, latitude: -90}} },
			euroSport: {climbingTypes: ['Sport'], map: {zoom: 2, center: {latitude: 55.875310835696816, longitude: 11.162109375}, northeast: {longitude: 82.529296875, latitude: 71.69129271864}, southwest: {longitude: -60.205078125, latitude: 29.38217507514534}} },
			summerNA: {months: {start: 6, end: 9}, map: {zoom: 2, center: {latitude: 46.80005944678737, longitude: -100.986328125}, northeast: {longitude: -29.619140625, latitude: 67.067433351083}, southwest: {longitude: -172.353515625, latitude: 17.30868788677006}}}
		}
		
		scroller.scrollTo('filterContainer', {
			duration: 800,
			delay: 0,
			smooth: "easeInOutQuart",
			offset: 0 
		});

		if (presets[preset]) {
			var presetObj = presets[preset];
			let newFilters: FilterParams = new FilterParams(filterHook.filterState);
			newFilters.removeAllFilters();

			if (presetObj.map) {
				newFilters.center.lat = presetObj.map.center.latitude;
				newFilters.center.lng = presetObj.map.center.longitude;
				newFilters.zoom = presetObj.map.zoom;
				newFilters.southWest.lat = presetObj.map.southwest.latitude;
				newFilters.southWest.lng = presetObj.map.southwest.longitude;
				newFilters.northEast.lat = presetObj.map.northeast.latitude;
				newFilters.northEast.lng = presetObj.map.northeast.longitude;
			}

			if (presetObj.months) {
				newFilters.startMonth = months.find(x => x.month === presetObj.months.start);
				newFilters.endMonth = months.find(x => x.month === presetObj.months.end);
			}

			if (presetObj.climbingTypes) {
				if (climbTypes.length === 0) {
					let filterOptionsFetch = await fetch('/api/filters');
					let filterOptions = await filterOptionsFetch.json() as any;
					climbTypes = filterOptions.climbTypes;
				}

				newFilters.climbingTypesFilter = climbTypes.filter(x => presetObj.climbingTypes.includes(x.type));
			}

			filterHook.setFilterState(newFilters);
		}
	}
	return (
		<div className="home-hero d-none d-md-block">
			<div className="home-hero-overlay">
				<div className="home-hero-overlay-title">
					<div>
						<div className="btn btn-climbcation preset alpine hidden-sm" onClick={() => goToFilter('alpine')}>
							Get Psyched on Alpine Rock Season
						</div>
						<div className="btn btn-climbcation preset euro-sport" onClick={() => goToFilter('euroSport')}>
							Taste Some European Sport climbing
						</div>
						<div className="btn btn-climbcation preset summer-na" onClick={() => goToFilter('summerNA')}>
							Summer Road Trip Through North America
						</div>
					</div>
				</div>
				<img className="pull-left hidden-xs" src={heroImageLeft} alt=""/>
				<img className="pull-right hidden-xs" src={heroImageRight} alt=""/>
			</div>
		</div>
	);
}

export default Home;