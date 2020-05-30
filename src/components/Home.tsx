import React, {createContext, useState, useContext, useEffect} from 'react';
import heroImageLeft from '../images/hero-image-left.png';
import heroImageRight from '../images/hero-image-right.png';
import skyscannerinline from '../images/skyscannerinline.png';
import Filter from './Filter';
import LocationTilesContainer from './LocationsTilesContainer';
import useFilterParams, {filterHook} from './useFilterParams';
import useLocationsFetcher, { LocationsFetch } from './useLocationsFetcher';
import { FilterParams } from '../classes/FilterParams';
import Map from './MapFilter';
import classNames from 'classnames';
import axios from 'axios';
import { animateScroll } from "react-scroll";

export const FilterContext = createContext<filterHook>({});
export const LocationsContext = createContext<LocationsFetch>({});

function Home() {
	let filterParamHook = useFilterParams();
	let locationsFetchHook = useLocationsFetcher(filterParamHook);
	let [largeMapEnabled, setLargeMapEnabled] = useState<boolean>(false);

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
			options: {
			center: filterParamHook.filterState.center,
			zoom: 2,
			mapTypeId: 'roadmap',
			id: 'mapFilterLarge',
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
	let [mapProps, setMapProps] = useState(getNewMapProps());

	useEffect(() => {
		setMapProps(getNewMapProps());
	}, [largeMapEnabled])

	useEffect(() => {
		setMapProps(getNewMapProps());
	}, [locationsFetchHook.unpaginatedLocations])

	return (
		<FilterContext.Provider value={filterParamHook}>
        <LocationsContext.Provider value={locationsFetchHook}>
			<section>
				<img src={skyscannerinline} style={{display: 'none'}} alt=""/>
				<Hero />
				<Filter largeMapEnabled={largeMapEnabled} setLargeMapEnabled={setLargeMapEnabled} hoveredLocation={hoveredLocation} />
				<div className="row">
					<div id="locations-window" className={classNames({'large-map': largeMapEnabled})}>
						<LocationTilesContainer setHoveredLocation={setHoveredLocation} />
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

function Hero() {
	return (
		<div className="home-hero hidden-xs">
			<div className="home-hero-overlay">
				<div className="home-hero-overlay-title">
					<div>
						<div className="btn btn-climbcation preset alpine hidden-sm" ng-click="goToFilter('alpine')">
							Get Psyched on Alpine Rock Season
						</div>
						<div className="btn btn-climbcation preset euro-sport" ng-click="goToFilter('euroSport')">
							Taste Some European Sport climbing
						</div>
						<div className="btn btn-climbcation preset summer-na" ng-click="goToFilter('summerNA')">
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