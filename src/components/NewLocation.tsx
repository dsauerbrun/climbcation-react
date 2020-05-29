/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Location, {Accommodation, FoodOption, Transportation, MiscSection, ClimbingType, Grade} from '../classes/Location';
import { useForm } from 'react-hook-form';
import classNames from 'classnames';
import { useForceUpdate } from '../common/useForceUpdate';
import AirportAutocomplete from '../common/AirportAutocomplete';
import { airport, allAirports } from '../common/airportsList';
import { useEditables, Month, TransportationOption, AccommodationOption } from '../common/useEditables';
import _ from 'lodash';
import { Tooltip, OverlayTrigger, Overlay, Popover } from 'react-bootstrap';
import cljFuzzy from 'clj-fuzzy';

interface LocationForm {
	soloFriendly: boolean;
	name: string;
	country: string;
	rating: number;
	airport: airport;
	climbTypes: ClimbingType[];
	months: Month[];
	grades: Grade[];
	transportations: TransportationOption[];
	bestTransportation: TransportationOption;
	bestTransportationCost: string;
	gettingInNotes: string;
	walkingDistance: boolean;
	accommodations: AccommodationOption[],
	accommodationCosts: {range: string}[],
	closestAccommodation: string,
	accommodationNotes: string,
}

function NewLocation () {
	let [formAlerts, setFormAlerts] = useState({error: null, success: false});
	let { register, handleSubmit, watch, errors, formState, setValue, getValues } = useForm<LocationForm>({});
	let {dirty, isSubmitting, touched, submitCount} = formState
	let [page, setPage] = useState<number>(1);
	let [location, setLocation] = useState<Location>((new Location({})));
	let {accommodations, climbingTypes, months, grades, foodOptions, transportations} = useEditables();
	let locationName = watch('name');
	let completeFunc = () => {

	}
	const onSubmit = async (data) => {
		console.log('here is data')
		console.log(data);
		if (page !== 5) {
			setPage(page + 1);
		}
	}

	return (<div id="submit-form">
		<div id="errorModal" className="modal">
			<div className="modal-dialog">
				<div className="modal-content">
					<div className="modal-header">
						<button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
						<h4 className="modal-title">Woops!</h4>
					</div>
					<div className="modal-body">
						<p>Looks like you forgot to fill something out in the general section. We're gonna need you to fill out all the starred fields in order to accept this location.</p>
					</div>
					<div className="modal-footer">
						<button type="button" data-dismiss="modal" className="btn btn-default">Close</button>
					</div>
				</div>
			</div>
		</div>


		<div className="text-center">
			<h3 className="title-header">Climbcation Location Creation</h3>
		</div>
		<NewLocationHeader currentPage={page} generalComplete={completeFunc} gettingInComplete={completeFunc} accommodationComplete={completeFunc} costComplete={completeFunc} changePage={setPage} />
		<form onSubmit={handleSubmit(onSubmit)} >
			<div className="form-container">
				<div >
					<div className="row bottom-padding">
						{page === 1 && <h4 className="offset-md-3 col-md-9" >1. General <span className="small-gray">(Don't worry, this is the hardest step!)</span></h4>}
						{page === 2 && <h4 className="offset-md-3 col-md-9" >2. Getting In <span className="small-gray">(How do you get to the crag?)</span></h4>}
						{page === 3 && <h4 className="offset-md-3 col-md-9" >3. Accommodation <span className="small-gray">(Where will you stay when you get there?)</span></h4>}
						{page === 4 && <h4 className="offset-md-3 col-md-9" >4. Cost <span className="small-gray">(How much should you expect to spend on this trip?)</span></h4>}
						{page === 5 && <h4 className="offset-md-3 col-md-9" >5. Other <span className="small-gray">(Anything else you know about { location?.name}?)</span></h4>}
						{page === 6 && <h4 className="offset-md-3 col-md-9" >6. Done</h4>}
					</div>
					<div className="row">
						<div className="offset-md-3 offset-xs-1 col-xs-10 col-md-6 well climbcation-well forms-container">
							<div className="well-content">
								<GeneralSection locationName={locationName} register={register} watch={watch} getValues={getValues} setValue={setValue} grades={grades} months={months} climbingTypes={climbingTypes} style={{display: page === 1 ? '' : 'none'}} />
								{page === 2 && <GettingInSection locationName={locationName} register={register} watch={watch} getValues={getValues} setValue={setValue} transportationOptions={transportations} style={{display: page === 2 ? '' : 'none'}}/>}
								{page === 3 && <AccommodationSection locationName={locationName} register={register} watch={watch} getValues={getValues} setValue={setValue} accommodationOptions={accommodations} style={{display: page === 3 ? '' : 'none'}}/>}
							</div>
							<div className="col-md-12 well-footer">
								<div className="row">
									{page !== 6 &&<div className="offset-md-8 col-md-1 offset-xs-7 col-xs-2" ng-click="prevPage()">
										{page !== 1 && page !== 6 && <span className="text-button" onClick={() => setPage(page - 1)} >Back</span>}
									</div>}
									{page < 5 && <div className="col-xs-2 btn btn-climbcation" onClick={() => setPage(page + 1)}>
										<div className=" ">Next</div>
									</div>}
									<button className="col-xs-2 btn btn-climbcation" style={{display: page === 5 ? '' : 'none'}} id="publish-button" ng-click="submitLocation()">
										<div className=" " ng-if="!loading">Publish</div>
										<img ng-src="/images/climbcation-loading.gif" ng-if="loading" alt="loading"/>
									</button>
									{page === 6 && <><div className="offset-xs-7 col-xs-1 right-margin">
										<div className="text-button"><a ng-href="/location/{{locationSlug}}" target="_blank">Preview</a></div>
									</div>
									<div className="col-xs-3 btn btn-climbcation" ng-click="startNewLocation()">
										Submit Another Location
									</div></>}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</form>



	</div>);
}

interface SectionProps {
	locationName: string,
	register: any,
	watch: any,
	getValues: any,
	setValue: any,
	months?: Month[],
	grades?: Grade[],
	climbingTypes?: ClimbingType[],
	transportationOptions?: TransportationOption[],
	accommodationOptions?: AccommodationOption[],
	style?: any	
}

function AccommodationSection({locationName, register, setValue, getValues, watch, accommodationOptions, style}: SectionProps) {
	useEffect(() => {
		if (!getValues().accommodations && !getValues().accommodationCosts && !getValues().closestAccommodation && !getValues().accommodationNotes) {
			register({ name: 'accommodations' });
			register({ name: 'accommodationCosts' });
			register({ name: 'closestAccommodation' });
			register({name: 'accommodationNotes'});
		}
	}, [register]);
	let selectedAccommodations: AccommodationOption[] = watch('accommodations');
	let accommodationCosts = watch('accommodationCosts');
	let accommodationNotes = watch('accommodationNotes');
	let closestAccommodation = watch('closestAccommodation');

	let toggleAccommodation = (accommodation: AccommodationOption) => {
		let newAccommodations: AccommodationOption[] = _.cloneDeep(selectedAccommodations) || [];
		if (newAccommodations.find(x => x.id === accommodation.id)) {
			newAccommodations = newAccommodations.filter(x => x.id !== accommodation.id);
			changeAccommodationCost(accommodation, {currentTarget: {value: ''}})
		} else {
			newAccommodations.push(accommodation);

		}

		setValue([{accommodations: newAccommodations}]);

	}

	let changeAccommodationCost = (accommodation: AccommodationOption, event) => {
		if (accommodationCosts) {
			accommodationCosts[accommodation.name] = event.currentTarget.value;
		} else {
			accommodationCosts = {};
			accommodationCosts[accommodation.name] = event.currentTarget.value;
		}

		setValue([{accommodationCosts: accommodationCosts}]);
	}

	let accommodationSelected = (accommodation: AccommodationOption): boolean => {
		return Boolean(selectedAccommodations?.find(x => x.id === accommodation.id));
	}

	return (
		<div className="row">
			<div className="col-md-12 row">
				<div className="col-md-12">
					<label className="center-block">Select all available options for accommodation in {locationName}</label>
					<div className="accommodation-options side-pad border-bottom bottom-margin">
						{accommodationOptions?.map(accommodation => (<div key={`accommodationOptions${accommodation.id}`} className="accommodation-button-wrapper">
							<input name="accommodations" className="accommodation-checkbox" type="checkbox" id={ accommodation.name } onChange={() => toggleAccommodation(accommodation)} checked={accommodationSelected(accommodation)} style={{display: 'none'}} />
							<label htmlFor={accommodation.name} className="btn btn-default accommodation-button">
								<img src={accommodation.url} alt="accommodation" />
								<div className="accommodation-cost-container">
									<label className="light-blue">Cost</label>
									<select name={`accommodationCosts.${accommodation.name}`} onChange={(e) => changeAccommodationCost(accommodation, e)} value={accommodationCosts && accommodationCosts[accommodation.name]} className="form-control" >
										<option value={null}></option>
										{accommodation?.ranges.map(range => (<option key={range} value={range}>{range}</option>))}
									</select>
								</div>
							</label>
						</div>))}	
					</div>
				</div>
			</div>
			<div className="col-md-12 row">
				<div className="col-md-6">
					<label>Any Additional Tips on staying in {locationName}?</label>
					<div className="form-group">
						<textarea placeholder="ex. campground doesnt have water, bring your own. The most fun place to stay is JOSITO! campground has a communal kitchenand communal fridge" className="form-control" rows={4} name="accommodationNotes" onChange={(e) => setValue([{accommodationNotes: e.target.value}])} value={accommodationNotes}></textarea>
					</div>
				</div>
				<div className="col-md-6">
					<label>How close is the closest accommodation to the crag(s)?</label>
					<select name="closestAccommodation" onChange={(e) => setValue([{closestAccommodation: e.currentTarget.value}])} value={closestAccommodation} className="form-control">
						<option value=""></option>
						<option value="'<1 mile'">&lt;1 mile</option>
						<option value="'1-2 miles'">1-2 miles</option>
						<option value="'2-5 miles'">2-5 miles</option>
						<option value="'5+ miles'">5+ miles</option>
					</select>
				</div>
			</div>
		</div>

	);
}

function GettingInSection({locationName, register, setValue, getValues, watch, transportationOptions, style}: SectionProps) {
	useEffect(() => {
		if (!getValues().transportations && !getValues().bestTransportation && !getValues().bestTransportationCost && !getValues().walkingDistance && !getValues().gettingInNotes) {
			register({ name: 'transportations' });
			register({ name: 'bestTransportation' });
			register({ name: 'bestTransportationCost' });
			register({name: 'walkingDistance'});
			register({name: 'gettingInNotes'});
		}
	}, [register]);
	let selectedTransportations: TransportationOption[] = watch('transportations');
	let bestTransportation: TransportationOption = watch('bestTransportation');
	let bestTransportationCost: string = watch('bestTransportationCost');
	let walkingDistance: boolean = watch('walkingDistance');
	let gettingInNotes = watch('gettingInNotes');

	let toggleTransportation = (transportation: TransportationOption) => {
		let newTransportations: TransportationOption[] = _.cloneDeep(selectedTransportations) || [];
		if (newTransportations.find(x => x.id === transportation.id)) {
			newTransportations = newTransportations.filter(x => x.id !== transportation.id);
		} else {
			newTransportations.push(transportation);

		}

		setValue([{transportations: newTransportations}]);

	}

	let transportationIsChecked = (transportationIter: TransportationOption): boolean => {
		return Boolean(selectedTransportations?.find(x => x.id === transportationIter.id));
	}

	return (
		<div className="row">
			<div className="col-md-12 bottom-padding border-bottom bottom-margin">
				<div className="row">
					<div className="col-md-6">
						<label className="col-md-12">Select all available options for getting to {locationName}</label>
						{transportationOptions?.map(transportation => (<div className="col-md-12 col-xs-4" key={transportation.id}>
							<label className="control control--checkbox" htmlFor={ transportation.name }>
								<input name={transportation.name} type="checkbox" id={ transportation.name } onChange={() => toggleTransportation(transportation)} checked={transportationIsChecked(transportation)} />
								<div className="control__indicator"></div>
								<span className="gray">{transportation.name}</span>
							</label>
						</div>))
						}
					</div>
					<div className="col-md-6">
						{selectedTransportations?.length > 0 && <div className="row">
							<label>What is the best option for getting to {locationName}</label>
							<div className="btn-group btn-group-sm center-block">
								{selectedTransportations?.map((bestTransportationOption, index) => (<React.Fragment key={bestTransportationOption.id}><input type="radio" name="bestTransportation" onChange={() => setValue([{bestTransportation: bestTransportationOption}])} checked={bestTransportationOption?.id === bestTransportation?.id}  id={`bestTransOption${bestTransportationOption.id}`} style={{display: 'none'}}/> 
								<label className={classNames("btn btn-sm btn-default")} htmlFor={`bestTransOption${bestTransportationOption.id}`} style={{borderTopLeftRadius: index === 0 ? '3px' : '', borderBottomLeftRadius: index === 0 ? '3px' : ''}}>
									{bestTransportationOption.name}	
								</label></React.Fragment>))}
							</div>
						</div>}
						{bestTransportation && <div className="row">
							<label>How much does a {bestTransportation?.name} cost?</label>
							<div className="btn-group btn-group-sm center-block">
								{bestTransportation?.ranges?.map((range, index) => (<React.Fragment key={range}><input type="radio" name="bestTransportationCost" onChange={() => setValue([{bestTransportationCost: range}])} checked={bestTransportationCost === range}  id={`bestTransOptionCost${range}`} style={{display: 'none'}}/> 
								<label className={classNames("btn btn-sm btn-default")} htmlFor={`bestTransOptionCost${range}`} style={{borderTopLeftRadius: index === 0 ? '3px' : '', borderBottomLeftRadius: index === 0 ? '3px' : ''}}>
									{range}	
								</label></React.Fragment>))}
							</div>
						</div>}
					</div>
				</div>
			</div>
			<div className="col-md-12 row">
				<div className="col-md-6">
					<label>Any Additional Tips for getting to and around {locationName}?</label>
					<div className="form-group">
						<textarea placeholder="ex. Need to take flight to kos, then take a ferry from kos to kalymnos, once you're there you can hitchhike to get groceries easily or you can rent a scooter for $5 a day" className="form-control" rows={4} name="gettingInNotes" onChange={(e) => setValue([{gettingInNotes: e.target.value}])} value={gettingInNotes}></textarea>
					</div>
				</div>
				<div className="col-md-6">
					<label>Upon arrival, can you reliably get to where you need without a car/motorbike?(eg. crag, camping, food, etc...)</label>
					<i className="glyphicon glyphicon-info-sign text-gray" data-template-url="views/tooltips/startooltip.tpl.html" data-animation="am-flip-x" bs-tooltip="'May include alternative methods of transportation such as hitchhiking if there is a strong hitchhiking culture in the area.'"></i>
					<div className="btn-group btn-group-sm center-block btn-group-toggle" data-toggle="buttons" style={{width: '100%'}}>
						<input type="radio" name="walkingDistance" onChange={() => setValue([{walkingDistance: true}])} checked={walkingDistance === true}  id="walkingDistanceYes" style={{display: 'none'}}/> 
						<label className={classNames("btn btn-sm btn-default")} htmlFor={`walkingDistanceYes`} style={{borderTopLeftRadius: '3px', borderBottomLeftRadius: '3px' }}>
							Yes	
						</label>
						<input type="radio" name="walkingDistance" onChange={() => setValue([{walkingDistance: false}])} checked={walkingDistance === false}  id="walkingDistanceNo" style={{display: 'none'}}/> 
						<label className={classNames("btn btn-sm btn-default")} htmlFor={`walkingDistanceNo`} >
							No
						</label>
					</div>
				</div>
			</div>
		</div>

	);
}

function GeneralSection({locationName, register, setValue, getValues, watch, months, grades, climbingTypes, style}: SectionProps) {
	useEffect(() => {
		if (!getValues().soloFriendly && !getValues().airport && !getValues().climbTypes && !getValues().grades && !getValues().months) {
			register({ name: "soloFriendly" });
			register({ name: 'airport'});
			register({ name: 'climbTypes'});
			register({ name: 'grades'});
			register({ name: 'months'});
		}
	}, [register]);

	let soloFriendly: boolean = watch('soloFriendly');
	let airport: airport = watch('airport');
	let climbTypes: ClimbingType[] = watch('climbTypes');
	let selectedMonths: Month[] = watch('months');
	let selectedGrades: Grade[] = watch('grades');
	let [existingLocation, setExistingLocation] = useState<string[]>();
	let [locationNames, setLocationNames] = useState([]);


	useEffect(() => {
		axios.get('api/location/name/all').then(function(locationList){
			setLocationNames(locationList.data);
		});
	}, [])
	const DICE_THRESHOLD = 0.75;

	let diceCalc = () => {
		let diceDistanceNum = 0;
		let similarLocation;
		_.forEach(locationNames, function(location) {
			var newDiceCalc = cljFuzzy.metrics.dice(location[0].toLowerCase(), locationName?.toLowerCase());
			if (newDiceCalc > diceDistanceNum) {
				diceDistanceNum = newDiceCalc;
				similarLocation = location;
			}
		});
		if (diceDistanceNum > DICE_THRESHOLD) {
			setExistingLocation(similarLocation);
		} else {
			existingLocation && setExistingLocation(null);
		}
	}

	let setSelectedAirport = (airport: airport) => {
		setValue([{airport: airport}]);
	}

	let toggleGrade = (grade: Grade | string, climbTypeId?: number) => {
		let gradeObj;
		if (typeof grade === 'string') {
			if (grade === '') {
				let newGrades = _.cloneDeep(selectedGrades) || [];
				newGrades = newGrades.filter(x => x.type.id !== climbTypeId)
				setValue([{grades: newGrades}]);
				return;
			}
			gradeObj = grades.find(x => x.id.toString() === grade);

		} else {
			gradeObj = grade;
		}
		let newGrades = _.cloneDeep(selectedGrades) || [];
		if (newGrades.find(x => x.id === gradeObj.id)) {
			newGrades = newGrades.filter(x => x.id !== gradeObj.id);
		} else {
			newGrades.push(gradeObj);
		}

		setValue([{grades: newGrades}]);
	}

	let toggleClimbType = (climb: ClimbingType) => {
		let newClimbTypes = _.cloneDeep(climbTypes) || [];
		if (newClimbTypes.find(x => x.id === climb.id)) {
			newClimbTypes = newClimbTypes.filter(x => x.id !== climb.id);
			let gradeToRemove = selectedGrades.find(x => x.type.id === climb.id);
			gradeToRemove && toggleGrade(gradeToRemove);
		} else {
			newClimbTypes.push(climb);
		}

		setValue([{climbTypes: newClimbTypes}]);
	}

	let toggleMonth = (month: Month) => {
		let newMonths = _.cloneDeep(selectedMonths) || [];
		if (newMonths.find(x => x.id === month.id)) {
			newMonths = newMonths.filter(x => x.id !== month.id);
		} else {
			newMonths.push(month);
		}

		setValue([{months: newMonths}]);
	}

	let monthChecked = (month: Month): boolean => {
		return Boolean(selectedMonths?.find(x => x.id === month.id));
	}

	let overlayTarget = useRef(null);
	return (
		<div className="row" style={style}>
			<div className="col-md-12">
				<div className="row"> {/*ng-className="{ 'has-success': locationForm.name.$valid && locationForm.name.$dirty, 'has-error': locationForm.name.$invalid && locationForm.name.$dirty }"*/}
					<span className={classNames("form-group col-md-4", {'has-success': 1, 'has-error': 0})}  >
						<label>Location Name<span className="text-danger required-field">*</span></label>
						<div ref={overlayTarget}>
							<input name="name" ref={register}  placeholder="ex. Yosemite" className="form-control"  onChange={() => diceCalc()} />
						</div>
						<Overlay
							placement="bottom"
							target={overlayTarget.current}
							show={Boolean(existingLocation)}
						>
							<Popover id="button-tooltip">
								<Popover.Content>
									<div style={{fontSize: '12px'}}>
										Did you mean {existingLocation && existingLocation[0]}? <a className="btn btn-climbcation" href={'/location/'+ (existingLocation && existingLocation[1])}>Click here to edit it!</a>
									</div>
								</Popover.Content>
							</Popover>
						</Overlay>
					</span>
					{/*ng-className="{ 'has-success': locationForm.country.$valid && locationForm.country.$dirty, 'has-error': locationForm.country.$invalid && locationForm.country.$dirty }"*/}	
					<span className="form-group col-md-4" >
						<label>Country</label>
						<input name="country" ref={register} placeholder="ex. United States" className="form-control" /> 
					</span>

					{/*ng-className="{ 'has-success': locationForm.solo_friendly.$valid && locationForm.solo_friendly.$dirty, 'has-error': locationForm.solo_friendly.$invalid && locationForm.solo_friendly.$dirty }"*/}
					<span className="form-group col-md-4">
						<label>Easy To Meet Partners?<span className="text-danger required-field">*</span></label>
						<div className="btn-group btn-group-sm center-block btn-group-toggle" data-toggle="buttons" style={{width: '100%'}}>
							<input type="radio" name="soloFriendly" onChange={() => setValue([{soloFriendly: true}])} checked={soloFriendly === true}  id="soloFriendlyYes" style={{display: 'none'}}/> 
							<label className={classNames("btn btn-sm btn-default")} htmlFor={`soloFriendlyYes`} style={{borderTopLeftRadius: '3px', borderBottomLeftRadius: '3px' }}>
								Yes	
							</label>
							<input type="radio" name="soloFriendly" onChange={() => setValue([{soloFriendly: false}])} checked={soloFriendly === false}  id="soloFriendlyNo" style={{display: 'none'}}/> 
							<label className={classNames("btn btn-sm btn-default")} htmlFor={`soloFriendlyNo`} >
								No
							</label>
							<input type="radio" name="soloFriendly" onChange={() => {setValue([{soloFriendly: null}]);}} checked={soloFriendly === null}  id="soloFriendlyFalse" style={{display: 'none'}}/> 
							<label className={classNames("btn btn-sm btn-default")} htmlFor={`soloFriendlyFalse`} onChange={() => {setValue([{soloFriendly: null}]);}}>
								Not Sure	
							</label>
						</div>
					</span>
				</div>
				<div className="row">
					{/*ng-className="{ 'has-success': locationForm.airport.$valid && locationForm.airport.$dirty, 'has-error': locationForm.airport.$invalid && locationForm.airport.$dirty }"  */}
					<span className="form-group col-md-4" >
						<label>Nearest Airport</label>
						<div className="airport-wrapper">
							<AirportAutocomplete selectedAirport={airport} setSelectedAirport={setSelectedAirport} />
						</div>
					</span>
					<div className="form-group col-md-8">
						<label>Rating:<span className="text-danger required-field">*</span></label>
						<div className="radio display-inline-block rating-container">
							<label>
								<input type="radio" name="rating" ref={register} value={1} />
								<span className="glyphicon glyphicon-star"></span><span className="glyphicon glyphicon-star-empty"></span><span className="glyphicon glyphicon-star-empty"></span> (Worth a stop)
							</label>
						</div>
						<div className="radio display-inline-block rating-container">
							<label>
								<input type="radio" name="rating" ref={register} value={2} />
								<span className="glyphicon glyphicon-star"></span><span className="glyphicon glyphicon-star"></span><span className="glyphicon glyphicon-star-empty"></span>
								(Worth a detour)
							</label>
						</div>
							<div className="radio display-inline-block rating-container">
							<label>
								<input type="radio" name="rating" ref={register} value={3} />
								<span className="glyphicon glyphicon-star"></span><span className="glyphicon glyphicon-star"></span><span className="glyphicon glyphicon-star"></span>
								(Worth a trip)
							</label>
						</div>
					</div>
				</div>
				<div className="row">
					<div className="col-md-3">
						<label className="col-xs-12">What should I climb?<span className="text-danger required-field">*</span></label>
						{climbingTypes?.map(climbingType => (
							<div className="col-xs-4 col-md-12" key={climbingType.name}>
								{/*ng-className="{'active': locationForm[climbing_type.name].$viewValue == true}" */}
								<label className="control control--checkbox" htmlFor={ `climbType${climbingType?.name}` } >
									<input type="checkbox" id={ `climbType${climbingType?.name}` } onChange={() => toggleClimbType(climbingType)} />
									<div className="control__indicator"></div>
									<span className="gray">{climbingType?.name}</span>
								</label>
							</div>	

						))}
					</div>
					<div className="col-md-4">
						<label>To get the most out of {locationName || 'this crag' } I should climb at least:<span className="text-danger required-field">*</span></label>
						{climbTypes?.map(climbType => <div className="grade-selector" key={climbType.id}>
							<img src={climbType.url} alt="climbing type" /> 
							<select onChange={(e) => toggleGrade(e.currentTarget.value, climbType.id)} className="form-control">
								<option value=''>Select a grade</option>
								{grades?.sort((a, b) => a.id > b.id ? 1 : -1).filter(grade => grade.type.id === climbType.id).map(grade => (
									<option key={grade.grade} value={grade.id}>{grade.grade} and above</option>
								))}
							</select>
						</div>)}
					</div>
					<div className="col-md-4">
						<label>When Should I go?<span className="text-danger required-field">*</span></label>
						<div className="month-button-container">
							{months?.map(month => (<div key={month.name} className="text-center month-button">
								<label htmlFor={ month.name } className={classNames("btn btn-climbcation", {active: monthChecked(month)})} >
									<input className="hide" name={month.name} type="checkbox" id={ month.name} style={{display: 'none'}} onChange={() => toggleMonth(month)} />
									{ month.name.substring(0,3) }
								</label>
							</div>))}
						</div>
					</div>
				</div>
			</div>
		</div>

	);
}

interface HeaderProps {
	currentPage: number; 
	generalComplete: Function;
	gettingInComplete: Function;
	accommodationComplete: Function;
	costComplete: Function;
	changePage: Function;
}

function NewLocationHeader({currentPage, generalComplete, gettingInComplete, accommodationComplete, costComplete, changePage}: HeaderProps) {
	let maxPages: number = 6;
	let progressBar: number = currentPage * 100 / 6; 

	let getIconUrl = (page: number) => {
		var url;
		if (page === currentPage) {
			return '/images/location-icon.png';
		} else if (page > currentPage) {
			return '';
		} else if (page < currentPage) {
			switch(page) {
				case 1:
					url = generalComplete() ? '/images/check-icon.png':'/images/x-icon.png';
					break;
				case 2:
					url = gettingInComplete() ? '/images/check-icon.png':'/images/warning-icon.png';
					break;
				case 3:
					url = accommodationComplete() ? '/images/check-icon.png':'/images/warning-icon.png';
					break;
				case 4:
					url = costComplete() ? '/images/check-icon.png':'/images/warning-icon.png';
					break;
				case 5:
					url = '/images/check-icon.png';
					break;
				case 6:
					url = '/images/check-icon.png';
					break;
			}
			return url;
		}

	}

	useEffect(() => {
		progressBar = currentPage * 100 / 6;
	}, [currentPage]);

	return (
		<div className="well climbcation-well no-padding progress-container">
			<div className="progress-icon-container">
				<span>{currentPage > 0 && <img alt="complete" src={getIconUrl(1)} />}</span>
				<span>{currentPage > 1 && <img alt="complete" src={getIconUrl(2)} />}</span>
				<span>{currentPage > 2 && <img alt="complete" src={getIconUrl(3)} />}</span>
				<span>{currentPage > 3 && <img alt="complete" src={getIconUrl(4)} />}</span>
				<span>{currentPage > 4 && <img alt="complete" src={getIconUrl(5)} />}</span>
				<span>{currentPage > 5 && <img alt="complete" src={getIconUrl(6)} />}</span>
			</div>
			<div className="progress-bar-wrapper">
				<div className="progress-bar" style={{width: `${progressBar}%`}}>
				</div>
			</div>
			<div className="titles">
				<a onClick={() => changePage(1)}><strong>1.</strong> <span className="hidden-xs">General*</span></a>
				<a onClick={() => changePage(2)}><strong>2.</strong> <span className="hidden-xs">Getting In</span></a>
				<a onClick={() => changePage(3)}><strong>3.</strong> <span className="hidden-xs">Accommodation</span></a>
				<a onClick={() => changePage(4)}><strong>4.</strong> <span className="hidden-xs">Cost</span></a>
				<a onClick={() => changePage(5)}><strong>5.</strong> <span className="hidden-xs">Other</span></a>
				<span><strong>6.</strong> <span className="hidden-xs">Publish</span></span>
			</div>
		</div>

	);
}

export default NewLocation;