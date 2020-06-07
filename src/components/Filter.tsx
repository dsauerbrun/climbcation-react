import React, {useEffect, useContext, useState} from 'react';
// eslint-disable-next-line
import { months, FilterParams, climbType, month, typeGrades, grade, AppliedFilter} from '../classes/FilterParams';
import classNames from 'classnames';
import {FilterContext, LocationsContext} from './Home';
import {ButtonGroup, Button, Dropdown} from 'react-bootstrap';
import {filterHook} from './useFilterParams';
import AirportAutocomplete from '../common/AirportAutocomplete';
import { IconTooltip } from '../common/HelperComponents';
import Map from './MapFilter';
import { LocationsFetch } from './useLocationsFetcher';
import { useHistory } from 'react-router-dom';
import { animateScroll, Element } from "react-scroll";
import { useMediaQuery } from 'react-responsive'

function FilterCrumbs(props: any) {
	let filters: FilterParams = props.filterParams;
	let setFilterState: Function = props.setFilterState;

	const removeAppliedFilter = (appliedFilter: AppliedFilter): void => {
		setFilterState((current) => {
			let newFilters: FilterParams = new FilterParams(current);
			newFilters.removeAppliedFilter(appliedFilter);

			return newFilters;
		});
	}

	const removeAllFilters = (): void => {
		setFilterState((current) => {
			let newFilters: FilterParams = new FilterParams(current);
			newFilters.removeAllFilters();

			return newFilters;
		});

	}

	let sortByRating = () => {
		setFilterState((current) => {
			let newFilters: FilterParams = new FilterParams(current);
			if (newFilters.sort?.rating?.asc) {
				newFilters.sort.rating = {asc: false};
			} else if (newFilters.sort?.rating?.asc === false) {
				newFilters.sort = {};
			} else {
				newFilters.sort = {rating: {asc: true}}
			}
			return newFilters;
		})
	}

	let sortByDistance = () => {
		if (filters.sort?.distance) {
			setFilterState((current) => {
				let newFilters: FilterParams = new FilterParams(current);
				newFilters.sort = {};
				return newFilters;

			})
		} else {
			navigator.geolocation.getCurrentPosition(
				function(position) {
					setFilterState((current) => {
						let newFilters: FilterParams = new FilterParams(current);
						newFilters.sort = {distance: {latitude: position.coords.latitude, longitude: position.coords.longitude}};
						return newFilters;
					});
				},
				function() {
					console.error('error getting location(probably blocked)');
					alert('Need location permission to sort by distance, ' +
						'if you arent given the option to grant permission, ' +
						'it is probably because your browser doesnt support non-ssl geolocation requests... the webmaster is a cheap bastard ' +
						'and doesnt want to spend $20/mo, go to https://climbcation.herokuapp.com and it should work just fine');
				}
			);
		}
	}

	return (
		<div className="row bottom-padding" style={{width: '90%', margin: '0 auto', height: '45px'}}>
			<div className="col-md-8">
				&nbsp;
				{filters?.appliedFilters?.length > 0 && <button className="applied-filter" onClick={() => removeAllFilters()}>Clear All</button>}
				{
					filters?.appliedFilters?.map(appliedFilter => (
						<div className="applied-filter" key={appliedFilter.title}>
							<span className="bold">{appliedFilter.title}<span className="close-button" onClick={() => removeAppliedFilter(appliedFilter)}>&times;</span></span>
						</div>
					))
				}
			</div>
			<div className="col-md-4">
				<label className="inline right-margin">Sort By:</label>
				<div className="text-button right-margin" onClick={() => sortByRating()}>{filters?.sort?.rating && <i className={classNames("glyphicon", {'glyphicon-sort-by-attributes': filters?.sort?.rating?.asc, 'glyphicon-sort-by-attributes-alt': !filters?.sort?.rating?.asc})}></i>}Rating</div>
				<div className="text-button" onClick={() => sortByDistance()}>{filters?.sort?.distance && <i className={classNames("glyphicon glyphicon-sort-by-attributes")}></i>}Distance From Me</div>
			</div>
		</div>
	);
}

function Filter({setLargeMapEnabled, largeMapEnabled, hoveredLocation, mobileMapOpen, mobileFilterOpen, setMobileFilterOpen, setMobileMapOpen}) {
	let {filterState, setFilterState} = useContext<filterHook>(FilterContext);
	let {unpaginatedLocations, selectedAirport, setSelectedAirport} = useContext<LocationsFetch>(LocationsContext);
	let [climbTypes, setClimbTypes] = useState<climbType[]>([]);
	let [typeGrades, setTypeGrades] = useState<typeGrades[]>([]);
	const isMobile = useMediaQuery({ maxWidth: 767 })


	useEffect(() => {
		async function setOptions() {
			let filterOptionsFetch = await fetch('/api/filters');
			let filterOptions = await filterOptionsFetch.json() as any;
			setClimbTypes(filterOptions.climbTypes);

			let grades: typeGrades[] = filterOptions.grades.map(function(x: any){
				return {climbingType: x.climbing_type, grades: x.grades.map((y: any) => ({...y, climbingType: y.climbing_type, typeId: x.climb_type_id})), typeHtml: x.type_html} as typeGrades;
			});
			setTypeGrades(grades);
		}
		
		setOptions();
	}, []);
	

	const filterClimbingType = (climbTypeFilter: climbType): void => {
		setFilterState((current: FilterParams) => {
			let newFilters: FilterParams = new FilterParams(current);
			if (climbTypeFilter.type === 'All') {
				newFilters.climbingTypesFilter = [];
			} else {
				newFilters.climbingTypesFilter = newFilters.climbingTypesFilter.filter(x => x.type !== 'All');
				if (newFilters.climbingTypesFilter.find(x => x.type === climbTypeFilter.type)) {
					newFilters.climbingTypesFilter = newFilters.climbingTypesFilter.filter(x => x.type !== climbTypeFilter.type);
				} else {
					newFilters.climbingTypesFilter.push(climbTypeFilter);
				}
			}

			return newFilters;
		});
	};

	const filterMonth = (startOrEnd: 'start' | 'end', month: month): void => {

		setFilterState && setFilterState((current: FilterParams) => {
			let newFilters: FilterParams = new FilterParams(current);
			if (startOrEnd === 'start') {
				newFilters.startMonth = month;
			} else {
				newFilters.endMonth = month;
			}
			
			return newFilters
		});
	}

	const filterRating = (starRating: number | 'All'): void => {

		setFilterState && setFilterState((current: FilterParams) => {
			let newFilters: FilterParams = new FilterParams(current);
			if (starRating === 'All') {
				newFilters.ratingsFilter = [];
			} else {
				let ratingIndex = newFilters.ratingsFilter.indexOf(starRating);

				if (ratingIndex > -1) {
					newFilters.ratingsFilter.splice(ratingIndex, 1);
				} else {
					newFilters.ratingsFilter.push(starRating);
				}
			}
		
			return newFilters
		});
	}

	const filterNoCar = (): void => {

		setFilterState((current: FilterParams) => {
			let newFilters: FilterParams = new FilterParams(current);
			newFilters.noCarFilter = !newFilters.noCarFilter;

			return newFilters;
		});
	}

	const filterSoloFriendly = (): void => {

		setFilterState && setFilterState((current) => {
			let newFilters: FilterParams = new FilterParams(current);
			newFilters.soloFriendlyFilter = !newFilters.soloFriendlyFilter;

			return newFilters;
		});
	}

	const filterGrade = (grade: grade): void => {
		if (grade.grade === 'All') {
			setFilterState && setFilterState((current) => {
				let newFilters: FilterParams = new FilterParams(current);
				newFilters.gradesFilter = newFilters.gradesFilter.filter(x => x.climbingType !== grade.climbingType);
				return newFilters;
			});
			return;
		} else {
			setFilterState && setFilterState((current) => {
				let newFilters: FilterParams = new FilterParams(current);
				newFilters.gradesFilter = newFilters.gradesFilter.filter(x => x.climbingType !== grade.climbingType);

				let newGrades = typeGrades.find(typeGrade => typeGrade.climbingType === grade.climbingType).grades.filter(typeGrade => typeGrade.order <= grade.order);
				newFilters.gradesFilter = [...newGrades, ...newFilters.gradesFilter];
				return newFilters;
			});
		}
	}

	const searchFilterChange = (e: any): void => {
		let newSearchText = e.target.value;
		setFilterState && setFilterState((current) => {
			let newFilters: FilterParams = new FilterParams(current);
			newFilters.searchFilter = newSearchText;

			return newFilters;
		});
	}

	const getFilterGradeType = (climbTypeName: string): grade | undefined | null => {
		let foundGradeFilter = filterState && filterState.gradesFilter?.sort((a,b) => a.order > b.order ? -1 : 1).find(x => x.climbingType === climbTypeName);
		return foundGradeFilter;
	}

	const isActiveClimbingType = (climbTypeFilter: climbType): boolean => {
		if (climbTypeFilter === null ) {
			if (filterState.climbingTypesFilter?.length === 0) {
				return true;
			} else {
				return false;
			}
		} else {
			return Boolean(filterState && filterState.climbingTypesFilter?.find(x => x.type === climbTypeFilter.type));
		}
	};
	const mapMoved = (map: google.maps.Map): void => {
		if (map) {
			setFilterState((current) => {
				let newFilters: FilterParams = new FilterParams(current);
				let southWest = map.getBounds().getSouthWest();
				let northEast = map.getBounds().getNorthEast();
				let center = map.getCenter();
				newFilters.southWest = {lat: southWest.lat(), lng: southWest.lng() };
				newFilters.northEast = {lat: northEast.lat(), lng: northEast.lng()}; 
				newFilters.center = {lat: center.lat(), lng: center.lng()};
				newFilters.page = 1;
				newFilters.zoom = map.getZoom();
				return newFilters;
			});
		}
	}
	const history = useHistory();

	let mapProps = {
		options: {
		  center: filterState.center,
		  zoom: filterState.zoom,
		  mapTypeId: 'roadmap',
		  id: isMobile ? 'mobileMapFilter' : 'mapFilter',
		  gestureHandling: 'greedy',
		  scrollWheel: false
		},
		latitude: filterState.center?.lat,
		longitude: filterState.center?.lng,
		zoom: filterState.zoom,
		onDragEnd: mapMoved,
		onZoomChange: mapMoved,
		markers: unpaginatedLocations,
		markerClickFunc: (location) => {
			history.push(`/location/${location.slug}`)
		},
		onMount: null, className: null, onMountProps: null, styles: (isMobile ? { width: '100% !important', height: '82vh'} : {width: '100%', height: null})
	};


	return (
		<>
		{isMobile && <section className={classNames("filter fixed", {'sticky-filter': !mobileFilterOpen && !mobileMapOpen, 'full-screen': mobileFilterOpen || mobileMapOpen})} >
			<div className="row filter-banner">
				{!mobileMapOpen && !mobileFilterOpen && <><div className="col-3" onClick={() => {setMobileFilterOpen(true); animateScroll.scrollToTop()}}>
					<div className="btn btn-climbcation">
						Filter
					</div>
				</div>
				<div className="offset-3 col-6" onClick={() => setMobileMapOpen(true)}>
					<div className="btn btn-climbcation pull-right">
						Open Map Filter
					</div>
				</div></>}
				{mobileFilterOpen && <div className="col-6" onClick={() => setMobileFilterOpen(false)}>
					<div className="btn btn-climbcation">
						Close Filters
					</div>
				</div>}
				{mobileMapOpen && <div className="offset-6 col-6" onClick={() => setMobileMapOpen(false)}>
					<div className="btn btn-climbcation pull-right">
						Close Map Filter
					</div>
				</div>}
			</div>
			<div style={{display: mobileMapOpen ? '' : 'none', height: '100% !important', width: '100% !important'}}>
				{!largeMapEnabled && <Map {...mapProps} hoveredLocation={hoveredLocation}></Map>}
			</div>
			<div style={{display: mobileFilterOpen ? '' : 'none'}}>
				<div className="container-fluid" style={{width: '80%', paddingLeft: '0'}}>		
					<div className="row">
						<div className="col-md-9">
							<div className="row offset-md-4 col-md-8">
								<h4 className="text-center" style={{width: '100%'}}>
									Select the relevant criteria to find your perfect climbing trip
								</h4>
							</div>
							<div className="row bottom-padding">
								<div className="col-md-5">
									<label>What do you want to climb?</label>
									<ButtonGroup className="btn-group-sm btn-group-filter">
										<Button bsPrefix={classNames(["filter-button btn btn-lg btn-default", {active: isActiveClimbingType(null)}])} onClick={() => filterClimbingType({type: 'All', url: 'none'})}>All</Button>
										{
											climbTypes?.map(x => 
												<Button bsPrefix={classNames(["filter-button btn btn-lg btn-default", {active: isActiveClimbingType(x)}])} key={x.type} onClick={() => filterClimbingType(x)}>{x.type}</Button>
											)
										}
									</ButtonGroup>
								</div>
								<div className="col-md-4">
									<label>Your Local Airport<span className="gray">(get flight prices!)</span></label>
									<div className="airport-wrapper">
										<AirportAutocomplete selectedAirport={selectedAirport} setSelectedAirport={setSelectedAirport} />
									</div>
								</div>
								<div className="col-md-3">
									<label>When do you want to go?</label>
									<Dropdown className="d-inline-block">
									<Dropdown.Toggle id="monthStart" childBsPrefix="btn btn-default dropdown-toggle">
										{filterState && filterState.startMonth.name && filterState.startMonth.name.substring(0,3)}
									</Dropdown.Toggle>

									<Dropdown.Menu>
										{	months.map(x => <Dropdown.Item onClick={() => filterMonth('start', x)} key={'startmonth'+x.name}>{x.name}</Dropdown.Item>)}
									</Dropdown.Menu>
									</Dropdown>
									<span className="text-gray">To </span>
									<Dropdown className="d-inline-block">
									<Dropdown.Toggle id="monthEnd" childBsPrefix="btn btn-default dropdown-toggle">
										{filterState && filterState.endMonth.name && filterState.endMonth.name.substring(0,3)}
									</Dropdown.Toggle>

									<Dropdown.Menu>
										{	months.map(x => <Dropdown.Item onClick={() => filterMonth('end', x)} key={'endmonth'+x.name}>{x.name}</Dropdown.Item>)}
									</Dropdown.Menu>
									</Dropdown>
								</div>
							</div>
							<div className="row">
								<div className="col-md-5">
									<label>What is the hardest grade you're looking for?</label>
									{
										typeGrades && typeGrades.map(typeGrade => (
											<ButtonGroup className="grade-filter-button" key={'typegrade'+typeGrade.climbingType}>
												<Dropdown>
												<Dropdown.Toggle id={'typegrade'+typeGrade.climbingType} childBsPrefix="filter-button btn btn-sm btn-default">
													{Boolean(getFilterGradeType(typeGrade.climbingType)) ? getFilterGradeType(typeGrade.climbingType)?.grade : typeGrade.climbingType}
												</Dropdown.Toggle>

												<Dropdown.Menu>
													<Dropdown.Item key={typeGrade.climbingType+'all'} onClick={() => filterGrade({grade: 'All', climbingType: typeGrade.climbingType, order: 0})}>All {typeGrade.climbingType} Grades</Dropdown.Item>
													{	typeGrade.grades.map(x => <Dropdown.Item key={typeGrade.climbingType+x.grade} onClick={() => filterGrade(x)}>{x.grade}</Dropdown.Item>)}
												</Dropdown.Menu>
												</Dropdown>
											</ButtonGroup>
										))
									}
								</div>
								<div className="col-md-4">
									<label>Keyword Search</label>
									<input type="text" className="form-control" placeholder="ex. beach" value={filterState?.searchFilter || ''} onChange={(e) => searchFilterChange(e)}/>
								</div>
								<div className="col-md-3">
									<div className="small-toggles-flex">
										<div>
											<label>Rating</label>
											<ButtonGroup className="btn-group-sm btn-group-filter">
												<Button bsPrefix={classNames(["filter-button btn btn-lg btn-default", {active: filterState?.ratingsFilter.length === 0}])} onClick={() => filterRating('All')}>All</Button>
												{
													[1,2,3].map(x => (
														<IconTooltip
															key={'rating'+x}
															tooltip={x === 1 ? 'Worth a stop' : (x === 2 ? 'Worth a detour' : 'Worth its own trip')}
															dom={
																<Button onClick={() => filterRating(x)} bsPrefix={classNames(["filter-button btn btn-lg btn-default"], {active: filterState?.ratingsFilter?.find(y => x === y)})}>
																	<span className="glyphicon glyphicon-star"></span>
																</Button>
															}
														></IconTooltip>
													))
												}
											</ButtonGroup>
										</div>
										<div>
											<label></label>
											<div style={{marginBottom: '5px'}}>
												<label className={classNames(["control control--checkbox"],{'active': filterState?.soloFriendlyFilter})}>
													<input type="checkbox" name="soloFriendlyEnabled" id="soloFriendlyEnabled" checked={filterState?.soloFriendlyFilter} onChange={() => filterSoloFriendly()} />
													<div className="control__indicator"></div>
													<span>Solo Friendly</span>
												</label>
											</div>
											<div>
												<label className={classNames(["control control--checkbox"], {'active': filterState?.noCarFilter})}>
													<input type="checkbox" name="noCarEnabled" id="noCarEnabled" checked={filterState?.noCarFilter} onChange={() => filterNoCar()}/>
													<div className="control__indicator"></div>
													<span>No Car?</span>
												</label>
											</div>
										</div>
									</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			<div ng-show="mapFilterShown">
			</div>
		</section>}
		{!isMobile && <div id="filter-container" className="filter d-none d-md-block">
			<Element name="filterContainer" className="container-fluid">		
				<div className="row">
					<div className="col-md-9">
						<div className="row offset-md-4 col-md-8">
							<h4 className="text-center" style={{width: '100%'}}>
								Select the relevant criteria to find your perfect climbing trip
							</h4>
							<h5 className="text-center" style={{width: '100%'}}>
								<strong>(results will update automatically based on your selection)</strong>
							</h5>
						</div>
						<div className="row bottom-padding">
							<div className="col-md-5">
								<label>What do you want to climb?</label>
								<ButtonGroup className="btn-group-sm btn-group-filter">
									<Button bsPrefix={classNames(["filter-button btn btn-lg btn-default", {active: isActiveClimbingType(null)}])} onClick={() => filterClimbingType({type: 'All', url: 'none'})}>All</Button>
									{
										climbTypes?.map(x => 
											<Button bsPrefix={classNames(["filter-button btn btn-lg btn-default", {active: isActiveClimbingType(x)}])} key={x.type} onClick={() => filterClimbingType(x)}>{x.type}</Button>
										)
									}
								</ButtonGroup>
							</div>
							<div className="col-md-4">
								<label>Your Local Airport<span className="gray">(get flight prices!)</span></label>
								<div className="airport-wrapper">
									<AirportAutocomplete selectedAirport={selectedAirport} setSelectedAirport={setSelectedAirport} />
								</div>
							</div>
							<div className="col-md-3">
								<label>When do you want to go?</label>
								<Dropdown className="d-inline-block">
									<Dropdown.Toggle id="monthStart" childBsPrefix="btn btn-default">
										{filterState && filterState.startMonth?.name && filterState.startMonth?.name.substring(0,3)}
									</Dropdown.Toggle>

									<Dropdown.Menu>
										{	months.map(x => <Dropdown.Item onClick={() => filterMonth('start', x)} key={'startmonth'+x.name}>{x.name}</Dropdown.Item>)}
									</Dropdown.Menu>
								</Dropdown>
								<span className="text-gray">To </span>
								<Dropdown className="d-inline-block">
									<Dropdown.Toggle id="monthEnd" childBsPrefix="btn btn-default">
										{filterState && filterState.endMonth?.name && filterState.endMonth?.name.substring(0,3)}
									</Dropdown.Toggle>

									<Dropdown.Menu>
										{	months.map(x => <Dropdown.Item onClick={() => filterMonth('end', x)} key={'endmonth'+x.name}>{x.name}</Dropdown.Item>)}
									</Dropdown.Menu>
								</Dropdown>
							</div>
						</div>
						<div className="row">
							<div className="col-md-5">
								<label>What is the hardest grade you're looking for?</label>
								{
									typeGrades && typeGrades.map(typeGrade => (
										<ButtonGroup className="grade-filter-button" key={'typegrade'+typeGrade.climbingType}>
											<Dropdown>
												<Dropdown.Toggle id={'typegrade'+typeGrade.climbingType} childBsPrefix="filter-button btn btn-sm btn-default">
													{Boolean(getFilterGradeType(typeGrade.climbingType)) ? getFilterGradeType(typeGrade.climbingType)?.grade : typeGrade.climbingType}
												</Dropdown.Toggle>

												<Dropdown.Menu>
													<Dropdown.Item key={typeGrade.climbingType+'all'} onClick={() => filterGrade({grade: 'All', climbingType: typeGrade.climbingType, order: 0})}>All {typeGrade.climbingType} Grades</Dropdown.Item>
													{	typeGrade.grades.map(x => <Dropdown.Item key={typeGrade.climbingType+x.grade} onClick={() => filterGrade(x)}>{x.grade}</Dropdown.Item>)}
												</Dropdown.Menu>
											</Dropdown>
										</ButtonGroup>
									))
								}
							</div>
							<div className="col-md-4">
								<label>Keyword Search</label>
								<input type="text" className="form-control" placeholder="ex. beach" value={filterState?.searchFilter || ''} onChange={(e) => searchFilterChange(e)}/>
							</div>
							<div className="col-md-3">
								<div className="small-toggles-flex">
									<div>
										<label>Rating</label>
										<ButtonGroup className="btn-group-sm btn-group-filter">
											<Button bsPrefix={classNames(["filter-button btn btn-lg btn-default", {active: filterState?.ratingsFilter?.length === 0}])} onClick={() => filterRating('All')}>All</Button>
											{
												[1,2,3].map(x => (
													<IconTooltip
														key={'rating'+x}
														tooltip={x === 1 ? 'Worth a stop' : (x === 2 ? 'Worth a detour' : 'Worth its own trip')}
														dom={
															<Button onClick={() => filterRating(x)} bsPrefix={classNames(["filter-button btn btn-lg btn-default"], {active: filterState?.ratingsFilter?.find(y => x === y)})}>
																<span className="glyphicon glyphicon-star"></span>
															</Button>
														}
													></IconTooltip>
												))
											}
										</ButtonGroup>
									</div>
									<div>
										<label></label>
										<div style={{marginBottom: '5px'}}>
											<label className={classNames(["control control--checkbox"],{'active': filterState?.soloFriendlyFilter})}>
												<input type="checkbox" name="soloFriendlyEnabled" id="soloFriendlyEnabled" checked={filterState?.soloFriendlyFilter} onChange={() => filterSoloFriendly()} />
												<div className="control__indicator"></div>
												<span>Solo Friendly</span>
											</label>
										</div>
										<div>
											<label className={classNames(["control control--checkbox"], {'active': filterState?.noCarFilter})}>
												<input type="checkbox" name="noCarEnabled" id="noCarEnabled" checked={filterState?.noCarFilter} onChange={() => filterNoCar()}/>
												<div className="control__indicator"></div>
												<span>No Car?</span>
											</label>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
					<div className="col-md-3">
						<span className="text-button right-margin" onClick={() => setLargeMapEnabled(!largeMapEnabled)} style={{marginBottom: '5px'}}>Toggle Large Map</span>
						{!largeMapEnabled && <Map {...mapProps} hoveredLocation={hoveredLocation}></Map>}
					</div>
				</div>
			</Element>
		</div>}
		<FilterCrumbs setFilterState={setFilterState} filterParams={filterState}></FilterCrumbs>
		</>
	);
}

export default Filter;