import React, {createContext} from 'react';
import heroImageLeft from '../images/hero-image-left.png';
import heroImageRight from '../images/hero-image-right.png';
import skyscannerinline from '../images/skyscannerinline.png';
import Filter from './Filter';
import LocationTilesContainer from './LocationsTilesContainer';
import useFilterParams, {filterHook} from './useFilterParams';
import useLocationsFetcher, { LocationsFetch } from './useLocationsFetcher';

export const FilterContext = createContext<filterHook>({});
export const LocationsContext = createContext<LocationsFetch>({});

function Home() {
	let filterParamHook = useFilterParams();
    let locationsFetchHook = useLocationsFetcher(filterParamHook);

	return (
		<FilterContext.Provider value={filterParamHook}>
        <LocationsContext.Provider value={locationsFetchHook}>
			<section>
				<img src={skyscannerinline} style={{display: 'none'}} alt=""/>
				<Hero />
				<Filter/>
				<LocationTilesContainer/>
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