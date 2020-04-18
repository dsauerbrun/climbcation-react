import React, {useEffect, useContext, useState} from 'react';
// eslint-disable-next-line
import { months, FilterParams, climbType, month, typeGrades, grade} from '../classes/FilterParams';
import classNames from 'classnames';
import {FilterContext} from './Home';
import {ButtonGroup, Button, Dropdown} from 'react-bootstrap';
import {filterHook} from './useFilterParams';

function Filter() {
	// eslint-disable-next-line
	let {filterState, setFilterState, addCount} = useContext<filterHook>(FilterContext);
	let [climbTypes, setClimbTypes] = useState<climbType[]>([]);
	let [typeGrades, setTypeGrades] = useState<typeGrades[]>([]);

	useEffect(() => {
		async function setOptions() {
			let filterOptionsFetch = await fetch('/api/filters');
			let filterOptions = await filterOptionsFetch.json() as any;
			setClimbTypes(filterOptions.climbTypes);

			
			let grades: typeGrades[] = filterOptions.grades.map(function(x: any){
				return {climbingType: x.climbing_type, grades: x.grades.map((y: any) => ({...y, climbingType: y.climbing_type, typeId: x.climbing_type_id})), typeHtml: x.type_html} as typeGrades;
			})
			setTypeGrades(grades);
		}
		
		setOptions();
	}, []);

	const filterClimbingType = (climbTypeFilter: climbType): void => {
		let newFilters: FilterParams = new FilterParams(filterState);
		if (climbTypeFilter.type === 'All') {
			newFilters.climbingTypesFilter = [climbTypeFilter];

		} else {
			newFilters.climbingTypesFilter = newFilters.climbingTypesFilter.filter(x => x.type !== 'All');
			newFilters.climbingTypesFilter.push(climbTypeFilter);
		}
		
		setFilterState && setFilterState(newFilters);
	};

	const filterMonth = (startOrEnd: 'start' | 'end', month: month): void => {
		let newFilters: FilterParams = new FilterParams(filterState);
		if (startOrEnd === 'start') {
			newFilters.startMonth = month;
		} else {
			newFilters.endMonth = month;
		}

		setFilterState && setFilterState(newFilters);
	}

	const filterRating = (starRating: number): void => {
		let newFilters: FilterParams = new FilterParams(filterState);
		let ratingIndex = newFilters.ratingsFilter.indexOf(starRating);

		if (ratingIndex > -1) {
			newFilters.ratingsFilter.splice(ratingIndex, 1);
		} else {
			newFilters.ratingsFilter.push(starRating);
		}

		setFilterState && setFilterState(newFilters);
	}

	const filterNoCar = (): void => {
		let newFilters: FilterParams = new FilterParams(filterState);
		newFilters.noCarFilter = !newFilters.noCarFilter;

		setFilterState && setFilterState(newFilters);
	}

	const filterSoloFriendly = (): void => {
		let newFilters: FilterParams = new FilterParams(filterState);
		newFilters.soloFriendlyFilter = !newFilters.soloFriendlyFilter;

		setFilterState && setFilterState(newFilters);
	}

	const filterGrade = (grade: grade): void => {
		let newFilters: FilterParams = new FilterParams(filterState);
		newFilters.gradesFilter = newFilters.gradesFilter.filter(x => x.climbingType !== grade.climbingType || x.id !== grade.id);
		if (grade.grade === 'All') {
			setFilterState && setFilterState(newFilters);
			return;
		} else {
			newFilters.gradesFilter.push(grade);
			setFilterState && setFilterState(newFilters);
		}
	}

	const searchFilterChange = (e: any): void => {
		let newFilters: FilterParams = new FilterParams(filterState);
		newFilters.searchFilter = e.target.value;

		setFilterState && setFilterState(newFilters);
	}

	const getFilterGradeType = (climbTypeName: string): grade | undefined | null => {
		let foundGradeFilter = filterState && filterState.gradesFilter.find(x => x.climbingType === climbTypeName);
		return foundGradeFilter;
	}

	const isActiveClimbingType = (climbTypeFilter: climbType): boolean => {
		return Boolean(filterState && filterState.climbingTypesFilter.find(x => x.type === climbTypeFilter.type));
	};

	return (
		<section className="filter hidden-xs">
			<pre>{JSON.stringify(filterState)}</pre>
			<button onClick={() => addCount && addCount()}>
        Click me
      </button>
			<div className="container-fluid">		
				<div className="col-md-9">
					<div className="row">
						<div className="row col-md-offset-4 col-md-8">
							<h4 className="text-center">
								Select the relevant criteria to find your perfect climbing trip
							</h4>
							<h5 className="text-center">
								<strong>(results will update automatically based on your selection)</strong>
							</h5>
						</div>
					</div>
					<div className="row bottom-padding">
						<div className="col-md-5">
							<label>What do you want to climb?</label>

							<ButtonGroup className="btn-group-sm btn-group-filter">
								<Button className={classNames(["filter-button btn btn-lg btn-default", {active: isActiveClimbingType({type: 'All', url: 'none'})}])} onClick={() => filterClimbingType({type: 'All', url: 'none'})}>All</Button>
								{
									climbTypes && climbTypes.map(x => 
										<Button className={classNames(["filter-button btn btn-lg btn-default", {active: isActiveClimbingType(x)}])} key={x.type} onClick={() => filterClimbingType(x)}>{x.type}</Button>
									)
								}
							</ButtonGroup>
							{/*<div className="btn-group btn-group-sm btn-group-filter"  role="group">
								<button ng-click="LocationsGetter.toggleFilterButton('climbing_types','All' )" type="button" className="filter-button btn btn-lg btn-default all" ng-className="{'active': LocationsGetter.isButtonActive('climbing_types', 'empty')}">All</button>
								<button ng-click="LocationsGetter.toggleFilterButton('climbing_types',name )" ng-repeat="(name,climbType) in filter.climbTypes" type="button" className="filter-button btn btn-lg btn-default" ng-className="{'active': LocationsGetter.isButtonActive('climbing_types', name)}" >{'name'}</button>
							</div>
							*/}
						</div>
						<div className="col-md-4">
							<label>Your Local Airport<span className="gray">(get flight prices!)</span></label>
							<div className="airport-wrapper">
								<input className="form-control" type="text" ng-model="helperService.originAirport" ng-click="clearPristine()" ng-trim="true" typeahead-min-length="3" 
								typeahead-wait-ms="100" uib-typeahead="airport.name for airport in helperService.getAirports($viewValue)"
								typeahead-popup-template-url="views/airport_autocomplete.tpl.html"
								typeahead-on-select="selectAirport($item, $model, $label, $event)" />
								<div className="loading-airports" ng-if="helperService.loadingAirports">
									<img src="/images/climbcation-loading.gif" alt="loading"/>
								</div>
							</div>
						</div>
						<div className="col-md-3">
							<label>When do you want to go?</label>
							<Dropdown className="d-inline-block">
							  <Dropdown.Toggle id="monthStart" className="btn btn-default dropdown-toggle">
							    {filterState && filterState.startMonth.name && filterState.startMonth.name.substring(0,3)}
							  </Dropdown.Toggle>

							  <Dropdown.Menu>
								  {	months.map(x => <Dropdown.Item onClick={() => filterMonth('start', x)} key={'startmonth'+x.name}>{x.name}</Dropdown.Item>)}
							  </Dropdown.Menu>
							</Dropdown>
							<span className="text-gray">To </span>
							<Dropdown className="d-inline-block">
							  <Dropdown.Toggle id="monthEnd" className="btn btn-default dropdown-toggle">
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
										  <Dropdown.Toggle id={'typegrade'+typeGrade.climbingType} className="filter-button btn btn-xs btn-default dropdown-toggle">
										    {Boolean(getFilterGradeType(typeGrade.climbingType)) ? getFilterGradeType(typeGrade.climbingType)?.grade : typeGrade.climbingType}
										  </Dropdown.Toggle>

										  <Dropdown.Menu>
										  	<Dropdown.Item key={typeGrade.climbingType+'all'} onClick={() => filterGrade({grade: 'All', climbingType: typeGrade.climbingType})}>All {typeGrade.climbingType} Grades</Dropdown.Item>
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
										<Button className="filter-button btn btn-lg btn-default">All</Button>
										{
											[1,2,3].map(x => (
												<Button onClick={() => filterRating(x)} className={classNames(["filter-button btn btn-lg btn-default"], {active: filterState?.ratingsFilter?.find(y => x === y)})} key={'rating'+x}>
													<span className="glyphicon glyphicon-star"></span>
												</Button>
											))
										}
									</ButtonGroup>

								</div>
								<div>
									<label></label>
									<div style={{marginBottom: '5px'}}>
										<label className={classNames(["control control--checkbox"],{'active': filterState?.soloFriendlyFilter})}>
											<input type="checkbox" name="soloFriendlyEnabled" id="soloFriendlyEnabled"  onClick={() => filterSoloFriendly()} />
											<div className="control__indicator"></div>
											<span>Solo Friendly</span>
										</label>
									</div>
									<div>
										<label className={classNames(["control control--checkbox"], {'active': filterState?.noCarFilter})}>
											<input type="checkbox" name="noCarEnabled" id="noCarEnabled" checked={filterState?.noCarFilter} onClick={() => filterNoCar()}/>
											<div className="control__indicator"></div>
											<span>No Car?</span>
										</label>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div className="col-md-3" ng-if="!filterMapDisabled">
				{
					/*
<map-filter ng-if="!mobile" filter-type="small">
					</map-filter>
					*/
				}
					
				</div>
			</div>
		</section>
	);
}

export default Filter;