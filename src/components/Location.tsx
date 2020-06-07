/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect, useState } from 'react';
import {useParams, Link} from "react-router-dom";
import axios from 'axios';
import classNames from 'classnames';
import Location, {Accommodation, FoodOption, Transportation, MiscSection} from '../classes/Location';
import AirportAutocomplete from '../common/AirportAutocomplete';
import Linkify from 'react-linkify';
import { useForm } from "react-hook-form";
import { useForceUpdate } from '../common/useForceUpdate';
import { scroller, Element } from "react-scroll";
import {Thread, PostInput} from './Forum';
import { Post } from '../classes/Forum';
import { IconTooltip } from '../common/HelperComponents';
import Map from './MapFilter';
import { useEditables, TransportationOption, AccommodationOption, FoodOptionOption } from '../common/useEditables';
import { useHistory } from 'react-router-dom';
import { airport, allAirports } from '../common/airportsList';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { transformQuotesToChartData } from './LocationsTilesContainer';
import Toast from 'react-bootstrap/Toast';
import skyscannerLogo from '../images/skyscannerinline.png';
import loading from '../images/climbcation-loading.gif';


interface PropLocation {
	location: Location;
	transportationOptions?: TransportationOption[];
	accommodationOptions?: AccommodationOption[];
	foodOptionOptions?: FoodOptionOption[];
	miscSection?: MiscSection;
	forceUpdate?: any;
	className?: string;
	saveCallback?: Function;
}

function NearbyMap({location}: PropLocation) {
	let height = '16em';
	const history = useHistory();
	let markerClick = (location) => {
		history.push(`/location/${location.slug}`)
	}
	let [mapProps, setMapProps] = useState({
		latitude: location?.latitude,
		longitude: location?.longitude,
		zoom: 6,
		options: {
		  center: {lat: location?.latitude, lng: location?.longitude},
		  zoom: 6,
		  mapTypeId: 'roadmap',
		  id: 'nearby-map'
		},
		onDragEnd: () => {},
		onZoomChange: () => {},
		markers: [],//location?.nearby || [],
		markerClickFunc: markerClick, 
		onMount: null, className: null, onMountProps: null, styles: {height: height, width: '100%'} 
	});

	useEffect(() => {
		setMapProps({
			latitude: location?.latitude,
			longitude: location?.longitude,
			zoom: 6,
			options: {
				center: {lat: location?.latitude, lng: location?.longitude},
				zoom: 6,
				mapTypeId: 'roadmap',
				id: 'nearby-map'
			},
			onDragEnd: () => {},
			onZoomChange: () => {},
			markerClickFunc: markerClick,
			markers: location?.nearby.concat([location]) || [],
			onMount: null, className: null, onMountProps: null, styles: {height: height, width: '100%'}
		});
	}, [location?.latitude, location?.nearby?.length])
	return (
		<>
			{location?.latitude !== null ? <Map {...mapProps} hoveredLocation={null} /> : <div>Loading</div>}
		</>
	);
}

function InfoHeader({location}: PropLocation) {

	let [nearbyShow, setNearbyShow] = useState<boolean>(false);
		return (
			<div className="container-fluid">
				<div className="row">
					<div className="col-md-12">
						<h2 className="text-center"> { location?.name }, { location?.country }</h2>
						<div className="main-header">
							<div className="well climbcation-well location-map">

								<div style={{display: 'block'}}>
									{location?.latitude && <NearbyMap location={location} />}
									<div className={classNames("nearby-locations", {expanded: nearbyShow})}>
										{nearbyShow && <div className="nearby-display">
											{location.nearby?.map((nearbyLoc) => (<div className="nearby-location" key={nearbyLoc.name}>
												<Link to={`/location/${nearbyLoc.slug}`}>{ nearbyLoc.name }</Link> <span className="text-gray bold">({nearbyLoc.distance} mi away)</span>
												{nearbyLoc?.climbing_types.map(nearbyType => (<img key={nearbyType.url} src={nearbyType.url} className="icon" alt="climbing type"/>))}
											</div>))}
										</div>}
										<a className="toggle" onClick={() => setNearbyShow(!nearbyShow)}>{ nearbyShow? '[-] Hide Nearby Locations':'[+] Show Nearby Locations' }</a>
									</div>
								</div>
							</div>
							<div className="location-photo well climbcation-well">
								{location?.home_thumb !== '/images/original/missing.png' ? (<img src={ location?.home_thumb } alt="location thumbnail"/>) :
								(<h3 className="text-center">
									<strong>Image Coming Soon</strong>
								</h3>)}
							</div>
							<div className="well climbcation-well overview-container">
								<h3 className="text-center">{ location?.name } Overview</h3>
								<div className="row">
									<div className="col-md-4 col-xs-4">
										<label>What should I climb?</label>
										{location?.climbing_types?.map(climbing_type => (<img key={climbing_type?.name} src={ climbing_type?.url } title={ climbing_type?.name } className="icon" alt="climbing type"/>))}
									</div>
									<div className="col-md-4 col-xs-4">
										<label>When Should I go?</label>
										<p className="text-gray info-text">{ location?.date_range }</p>
									</div>
									<div className="col-md-4 col-xs-4">
										<label>Solo Traveler Friendly?</label>
										{
											location?.solo_friendly === null ? (<p className="text-gray info-text">Maybe <IconTooltip tooltip={"'We\'re not sure if this place is solo friendly. Email info@climbcation.com if you can help us out with this one'"} dom={<i className="glyphicon glyphicon-info-sign"></i>} /></p>) : (
											<p className="text-gray info-text" >{location?.solo_friendly ? 'Yes' : 'No'} <IconTooltip tooltip={location?.solo_friendly ? 'You should be able to find partners easily if you\'re traveling solo.' : 'You may have trouble finding partners if you are traveling solo.'} dom={<i className="glyphicon glyphicon-info-sign"></i>} /></p>)
										}
									</div>
								</div>
								<div className="row">
									<div className="col-md-6 col-xs-6">
										<label>Difficulty (Most classics are)</label>
										{location?.grades.map(grade => <p key={`grade${grade.id}`} className={classNames("text-gray info-text", {'multiple-grades': location?.grades.length > 1})}>
											{location?.grades.length > 1 && <img src={grade.type.url} alt="grade type"/>}
											{grade.grade} 
											{location?.grades.length === 1 ? 'and harder':''}
										</p>)}
										{location?.grades.length > 1 && <p className="text-gray info-text multiple-grades"> (and harder)</p>}
									</div>
									<div className="col-xs-3 col-md-3">
										<label>Vehicle Req.</label>
										{location?.noCarNeeded() ? (
											<IconTooltip tooltip={'You can make a trip work here without a vehicle.'} dom={
											<div style={{width: '20px'}}>
												<svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 24 24" width="20" className="icon" style={{fill: '#3c7e91'}}><path d="M0 0h24v24H0z" fill="none"/><path d="M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9L7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3C14.8 12 16.8 13 19 13v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1L6 8.3V13h2V9.6l1.8-.7"/></svg>
											</div>} />
										) : (
											<IconTooltip tooltip={'Having a vehicle is recommended.'} dom={
											<div style={{width: '20px'}}>
												<svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 24 24" width="20" className="icon" style={{fill: '#3c7e91'}}><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/><path d="M0 0h24v24H0z" fill="none"/></svg>
											</div>} />
										)}
									</div>
									<div className="col-md-3 col-xs-3">
										<label>Rating</label>
										<IconTooltip tooltip={location?.ratingName()} 
										dom={
											<span>
												<span className="glyphicon glyphicon-star" ></span>
												<span className={classNames(['glyphicon', 'glyphicon-star', {'glyphicon-star-empty': location?.rating < 2}])} ></span>
												<span className={classNames(['glyphicon', 'glyphicon-star', {'glyphicon-star-empty': location?.rating < 3}])} ></span>
											</span>
										}
										></IconTooltip>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
}

function GettingIn({location, transportationOptions, saveCallback}: PropLocation) {
	interface GettingInForm {
		walking_distance: string;
		transportations: string[];
		bestTransportation: string;
		gettingInNotes: string;
		bestTransportationCost: string;
	}

	let [formAlerts, setFormAlerts] = useState({error: null, success: false});
	let { register, handleSubmit, watch, errors, formState, setValue, getValues } = useForm<GettingInForm>({});
	let {dirty, isSubmitting, touched, submitCount} = formState
	let [editingGettingIn, setEditingGettingIn] = useState<boolean>(false);
	let walkingDistance = watch('walking_distance');
	let transportations: string[] = watch('transportations');
	let bestTransportation: string = watch('bestTransportation');
	let bestTransportationCost: string = watch('bestTransportationCost');

	const onSubmit = async (data) => {
		if (!isSubmitting) {
			
			axios.post('/api/locations/' + location?.id +'/gettingin',
				{location: {
					walkingDistance: data.walking_distance === '' ? null : (data.walking_distance === 'true' ? true : false),
					transportations: data.transportations?.map(x => JSON.parse(x).id),
					bestTransportationCost: data.bestTransportationCost,
					bestTransportationId: data.bestTransportation && data.bestTransportation !== '' && JSON.parse(data.bestTransportation)?.id,
					gettingInNotes: data.gettingInNotes
				}} 
			).then(function(response) {
				if (response.status === 200) {
					axios.get('/api/location/' + location?.slug).then(function(response) {
						location.transportations = response?.data?.location?.transportations;
						location.getting_in_notes = response.data.location.getting_in_notes;
						location.best_transportation = response.data.location.best_transportation;
						location.walking_distance = response.data.location.walking_distance;
						setEditingGettingIn(false);
						saveCallback && saveCallback(true);
					});
				}
			});
		}
	};

	const toggleEdit = (shouldEdit: boolean) => {
		if (shouldEdit) {
			let filteredTransportationOptions = transportationOptions?.filter(x => location?.transportations.find(y => y.id === x.id));
			let bestTransportation = filteredTransportationOptions?.find(x => x.id === location?.best_transportation.id);
			let walkingDistanceSet = location?.walking_distance === null ? 'null' : (location?.walking_distance ? 'true' : 'false');
			setValue([
				{walking_distance: walkingDistanceSet},
				{transportations: filteredTransportationOptions?.map(x => JSON.stringify(x))},
				{gettingInNotes: location?.getting_in_notes}
			]);
		}
		setEditingGettingIn(shouldEdit);
	}

	useEffect(() => {
		let filteredTransportationOptions = transportationOptions?.filter(x => location?.transportations.find(y => y.id === x.id));
		let bestTransportation = filteredTransportationOptions?.find(x => x.id === location?.best_transportation.id);
		setValue([
			{bestTransportation: JSON.stringify(bestTransportation)},
		])
	}, [transportations?.length])

	useEffect(() => {
		setValue([
			{bestTransportationCost: bestTransportationCost || location?.best_transportation?.cost},
		])
	}, [bestTransportation])

	return (
		<div className="col-md-6">
			<div className="well climbcation-well" style={{display: editingGettingIn ? 'none': ''}}>
				<div className="row col-md-12 section-title">
					<h3 className="inline">Getting In</h3>
					<span className="text-button" onClick={() => toggleEdit(true)}>Edit Category</span>
				</div>
				{location?.walking_distance === null ? (<p className="text-gray info-text">We're not sure if you need a car/motorbike upon arrival to get to where you need.(eg. crag, food, camping, etc...) Have you been here? Please edit this section if you can help us out!</p>) :
				(<p className="text-gray info-text">
					Upon arrival, you <strong>{location?.walking_distance ? 'can' : 'cannot'} {location?.walking_distance && <IconTooltip tooltip={'May include alternative methods of transportation such as hitchhiking if there is a strong hitchhiking culture in the area.'} dom={<i className="glyphicon glyphicon-info-sign"></i>} />}</strong> get to where you need without a car/motorbike. (eg. crag, shelter, food)
				</p>)}
				<div className="info-container">
					<div>
						<label className="text-center">Available Options</label>
						<ul>
							{location?.transportations.map(transport => (<li key={transport.name} className="text-gray"><h5>{ transport.name }</h5></li>))}
						</ul>
					</div>
					<div>
						<label className="text-center">Best Transportation Option</label>
						<h4 className="text-center text-gray">{location?.best_transportation.name}</h4>
						<h5 className="text-center text-gray">{location?.best_transportation.cost !== '-1' ? location?.best_transportation.cost : ''}</h5>
					</div>
				</div>
				<label>Any additional tips about getting around {location?.name}?</label>
				<p className="text-gray info-text preserve-line-breaks">
					<Linkify>{location?.getting_in_notes || 'No Details Available'}</Linkify>
				</p>
			</div>
			
			<div className="well climbcation-well" style={{display: !editingGettingIn ? 'none': ''}}>
				<form onSubmit={handleSubmit(onSubmit)}>

					<div className="row section-title">
						<h3 className="col-md-7 col-xs-5">Getting In</h3>
						<div className="col-md-5 col-xs-7">
							<span className="text-button" onClick={() => toggleEdit(false)}>Cancel</span>
							<button className="btn btn-sm btn-climbcation submit-button" disabled={isSubmitting}>Submit Changes</button>
						</div>
					</div>
					<div className="row">
						<div className="col-md-8">
							<label>Upon arrival, can you reliably get to where you need without a car/motorbike?(eg. crag, camping, food, etc...)</label>
						</div>
						<div className="col-md-4">
							<IconTooltip tooltip={'May include alternative methods of transportation such as hitchhiking if there is a strong hitchhiking culture in the area.'} dom={<i className="glyphicon glyphicon-info-sign text-gray"></i>} />
							<div className="btn-group btn-group-sm center-block btn-group-toggle" style={{paddingLeft: '10px'}} data-toggle="buttons">
								<input type="radio" name="walking_distance" value="true" ref={register} id={'yesWalking'} style={{display: 'none'}}/> 
								<label className={classNames("btn btn-sm btn-default")} htmlFor={'yesWalking'} style={{borderTopLeftRadius: '3px', borderBottomLeftRadius: '3px'}}>
									Yes
								</label>
								<input type="radio" name="walking_distance" value="false" ref={register} id={'noWalking'} style={{display: 'none'}}/> 
								<label className={classNames("btn btn-sm btn-default")} htmlFor={'noWalking'}>
									No
								</label>
							</div>
						</div>
					</div>
					<div className="row">
						<div className="col-md-6">
							<label>Select all available options for getting to {location?.name} </label>
							{transportationOptions?.map((transportation: TransportationOption, index) => (<div key={transportation.id}>
								<input name="transportations" className="control-input-checkbox" ref={register} type="checkbox" id={ transportation.name } value={JSON.stringify(transportation)} />
								<label className={classNames(["control control--checkbox"])} htmlFor={transportation.name}>
									<div className="control__indicator"></div>
									<span className="gray">{transportation.name}</span>
								</label>
							</div>))
							}	
						</div>
						<div className="col-md-6">
							{transportations?.length > 0 && <div className="row">
								<label>What is the best option for getting to {location.name}</label>
								<div className="btn-group btn-group-sm center-block btn-group-toggle" data-toggle="buttons">
									{transportations?.map(x => JSON.parse(x)).map((bestTransOption: TransportationOption, index) => (
										<React.Fragment key={`bestTransOpt${bestTransOption.id}`}>
											<input type="radio" name="bestTransportation" value={JSON.stringify(bestTransOption)} ref={register} id={`bestTrans${bestTransOption.name}`} style={{display: 'none'}}/> 
											<label className={classNames("btn btn-sm btn-default")} htmlFor={`bestTrans${bestTransOption.name}`} style={{borderTopLeftRadius: index === 0 ? '3px' : '', borderBottomLeftRadius: index === 0 ? '3px' : ''}}>
												{bestTransOption.name}	
											</label>
										</React.Fragment>
									))}
								</div>
							</div>}
							{bestTransportation && <div className="row">
								<label>How much does a {JSON.parse(bestTransportation).name} cost?</label>
								<div className="btn-group btn-group-sm center-block btn-group-toggle">
									{JSON.parse(bestTransportation).ranges.map((costRange: string, index) => (
										<React.Fragment key={costRange}>
											<input type="radio" name="bestTransportationCost" value={costRange} ref={register} id={`bestCost${costRange}`} style={{display: 'none'}}/> 
											<label className={classNames("btn btn-sm btn-default")} htmlFor={`bestCost${costRange}`} style={{borderTopLeftRadius: index === 0 ? '3px' : '', borderBottomLeftRadius: index === 0 ? '3px' : ''}}>
												{costRange}	
											</label>
										</React.Fragment>
									))}
								</div>
							</div>}
						</div>
					</div>
					<div className="row">
						<div className="col-md-12">
							<label>Any Additional Tips for getting to and around {location?.name}?</label>
							<div className="form-group">
								<textarea placeholder="ex. Need to take flight to kos, then take a ferry from kos to kalymnos, once you're there you can hitchhike to get groceries easily or you can rent a scooter for $5 a day" className="form-control" rows={3} ref={register} name="gettingInNotes" />
							</div>
						</div>
					</div>
				</form>
			</div>
		</div>
	);
}
function Accommodations({location, accommodationOptions, saveCallback}: PropLocation) {
	interface AccommodationForm {
		closestAccommodation: string;
		accommodations: string[];
		accommodationCosts: any;
		accommodationNotes: string;
	}

	let [formAlerts, setFormAlerts] = useState({error: null, success: false});
	let { register, handleSubmit, watch, errors, formState, setValue, getValues } = useForm<AccommodationForm>({});
	let {dirty, isSubmitting, touched, submitCount} = formState
	let [editingAccommodation, setEditingAccommodation] = useState<boolean>(false);
	let accommodations: string[] = watch('accommodations');
	let accommodationCosts: any = watch('accommodationCosts');

	const toggleEdit = (shouldEdit: boolean) => {
		if (shouldEdit) {
			let costsObj = {Hotel: location?.accommodations.find(x => x.name === 'Hotel')?.cost, Hostel: location?.accommodations.find(x => x.name === 'Hostel')?.cost, Camping: location?.accommodations.find(x => x.name === 'Camping')?.cost};
			setValue([
				{closestAccommodation: location?.closest_accommodation},
				{accommodationNotes: location?.accommodation_notes},
				{accommodations: accommodationOptions.filter(acc => location?.accommodations.find(x => x.id === acc.id)).map(x => JSON.stringify(x))},
				{accommodationCosts: costsObj}
			]);
		}
		setEditingAccommodation(shouldEdit);
	}


	const onSubmit = async (data) => {
		if (!isSubmitting) {
			let mappedAccommodations = data.accommodations.map(x => {
				x = JSON.parse(x);
				let newObj = {id: x.id, name: x.name, cost: null};
				newObj.cost = data.accommodationCosts[x.name];
				return newObj;
			});
			axios.post('/api/locations/' + location?.id +'/accommodations',
				{location: {
					accommodationNotes: data.accommodationNotes,
					closestAccommodation: data.closestAccommodation,
					accommodations: mappedAccommodations	
				}} 
			).then(function(response) {
				if (response.status === 200) {
						setEditingAccommodation(false);
						saveCallback && saveCallback(true);
				}
			});
		}
	};

	return (
		<div className="col-md-6">
			<div className="well climbcation-well" style={{display: !editingAccommodation ? '' : 'none'}}>
				<div className="col-md-12 row section-title">
					<h3 className="inline">Accommodation</h3>
					<span className="text-button" onClick={() => toggleEdit(true)}>Edit Category</span>
				</div>
				{!location?.closest_accommodation ? 
				(<p className="text-gray info-text">We're not sure how close the accommodation is from the crags... have you been here? Please edit this section if you can help us out!</p>) :
				(<p className="text-gray info-text">Closest accommodation is <strong>{location?.closest_accommodation}</strong> from the crags.</p>)
				}
				<div className="info-container">
					{location?.accommodations?.map(accommodation => (<div key={`accomdisplay${accommodation.id}`} className="accommodation-info-section">
						<h4 className="text-gray text-center">{accommodation.name}</h4>
						<img src={accommodation.url} alt="accommodation"/>
						<h5 className="text-gray text-center">{accommodation.cost}</h5>
					</div>))}
				</div>
				<label>Any additional tips for staying in {location?.name}?</label>
				<p className="text-gray info-text preserve-line-breaks" ><Linkify>{location?.accommodation_notes || 'No Details Available'}</Linkify></p>
			</div>
			<div className="well climbcation-well" style={{display: editingAccommodation ? '' : 'none'}}>
				<form onSubmit={handleSubmit(onSubmit)}>
					<div className="row section-title">
						<h3 className="col-md-7 col-xs-5">Accommodation</h3>
						<div className="col-md-5 col-xs-7">
							<span className="text-button" onClick={() => toggleEdit(false)}>Cancel</span>
							<button className="btn btn-sm btn-climbcation submit-button" disabled={isSubmitting}>Submit Changes</button>
						</div>
					</div>
					<div className="row">
						<div className="col-md-8">
							<label>How close is the closest accommodation to the crag(s)?</label>
							
						</div>
						<div className="col-md-4">
							<select name="closestAccommodation" ref={register} className="form-control">
								<option value="<1 mile">&lt;1 mile</option>
								<option value="1-2 miles">1-2 miles</option>
								<option value="2-5 miles">2-5 miles</option>
								<option value="5+ miles">5+ miles</option>
							</select>
						</div>
					</div>
					<div className="row">
						<div className="col-md-12">
							<label className="center-block">Select all available options for accommodation in {location?.name}</label>
							<div className="accommodation-options">
								{accommodationOptions?.map(accommodation => (<div key={`accommodationOptions${accommodation.id}`} className="accommodation-button-wrapper">
									<input name="accommodations" className="accommodation-checkbox" ref={register} type="checkbox" id={ accommodation.name } value={JSON.stringify(accommodation)} style={{display: 'none'}} />
									<label htmlFor={accommodation.name} className="btn btn-default accommodation-button">
										<img src={accommodation.url} alt="accommodation" />
										<div className="accommodation-cost-container">
											<label className="light-blue">Cost</label>
											<select name={`accommodationCosts.${accommodation.name}`} ref={register} className="form-control" >
												<option value={null}></option>
												{accommodation?.ranges.map(range => (<option key={range} value={range}>{range}</option>))}
											</select>
										</div>
									</label>
								</div>))}	
							</div>
						</div>
					</div>
					<div className="row">
						<div className="col-md-12">
							<label>Any Additional Tips on staying in {location?.name}?</label>
							<div className="form-group">
								<textarea placeholder="ex. campground doesnt have water, bring your own. The most fun place to stay is JOSITO! campground has a communal kitchenand communal fridge" ref={register} className="form-control" rows={3} name="accommodationNotes"></textarea>
							</div>
						</div>
						
					</div>
				</form>
			</div>
		</div>

	);
}

function CostComponent({location, foodOptionOptions, saveCallback}: PropLocation) {
	interface CostForm {
		foodOptions: string[];
		foodOptionCosts: any;
		commonExpensesNotes: string;
		savingMoneyTips: string;
	}

	let [formAlerts, setFormAlerts] = useState({error: null, success: false});
	let { register, handleSubmit, watch, errors, formState, setValue, getValues } = useForm<CostForm>({});
	let {dirty, isSubmitting, touched, submitCount} = formState
	let [editingCost, setEditingCost] = useState<boolean>(false);
	let selectedFoodOptions: string[] = watch('foodOptions');
	let currentFoodCostValues = watch('foodOptionCosts');

	const toggleEdit = (shouldEdit: boolean) => {
		if (shouldEdit) {
			setValue([
				{commonExpensesNotes: location?.common_expenses_notes},
				{savingMoneyTips: location?.saving_money_tips},
				{foodOptions: foodOptionOptions.filter(food => location?.food_options.find(x => x.id === food.id)).map(x => JSON.stringify(x))},
			]);
		}
		setEditingCost(shouldEdit);
	}

	useEffect(() => {
		let farmerMarketCost = (!currentFoodCostValues || !currentFoodCostValues["Farmer's Market"] || currentFoodCostValues["Farmer's Market"] === "") ? location?.food_options?.find(x => x.name === "Farmer's Market")?.cost : currentFoodCostValues["Farmer's Market"];
		let restaurantCost = (!currentFoodCostValues || !currentFoodCostValues["Restaurant"] || currentFoodCostValues["Restaurant"] === "") ? location?.food_options?.find(x => x.name === "Restaurant")?.cost : currentFoodCostValues["Restaurant"];
		let groceryCost = (!currentFoodCostValues || !currentFoodCostValues["Grocery"] || currentFoodCostValues["Grocery"] === "") ? location?.food_options?.find(x => x.name === "Grocery")?.cost : currentFoodCostValues["Grocery"];
		let costsObj = {"Farmer's Market": farmerMarketCost, Grocery: groceryCost, Restaurant: restaurantCost};

		setValue([
			{foodOptionCosts: costsObj}
		]);

	}, [selectedFoodOptions?.length])

	const onSubmit = async (data) => {
		if (!isSubmitting) {
			let mappedFoodOptions = data.foodOptions.map(x => {
				x = JSON.parse(x);
				let newObj = {id: x.id, name: x.name, cost: null};
				newObj.cost = data.foodOptionCosts[x.name];
				return newObj;
			});
			axios.post('/api/locations/' + location?.id +'/foodoptions',
				{location: {
					savingMoneyTips: data.savingMoneyTips,
					commonExpensesNotes: data.commonExpensesNotes,
					foodOptionDetails: mappedFoodOptions	
				}} 
			).then(function(response) {
				if (response.status === 200) {
						setEditingCost(false);
						saveCallback && saveCallback(true);
				}
			});
		}
	};
	return (
		<div className="col-md-6">
			<div className="well climbcation-well" style={{display: !editingCost ? '' : 'none'}}>
				<div className="col-md-12 row section-title">
					<h3 className="inline">Cost</h3>
					<span className="text-button" onClick={() => toggleEdit(true)}>Edit Category</span>
				</div>
				<label>Food options (cost per meal)</label>
				<div className="info-container">
					{location?.food_options?.map(food_option => (<div key={food_option.id}>
						<h3 className="text-gray text-center">{food_option.name}</h3>
						<h4 className="text-gray text-center">{food_option.cost}</h4>
					</div>))}
				</div>
				<label>Any other common expenses in {location?.name}?</label>
				<p className="text-gray info-text preserve-line-breaks" ><Linkify>{location?.common_expenses_notes || 'No Details Available'}</Linkify></p>
				<label>Any tips on saving money around {location?.name}?</label>
				<p className="text-gray info-text preserve-line-breaks"><Linkify>{location?.saving_money_tips || 'No Details Available'}</Linkify></p>
			</div>
			<div className="well climbcation-well" style={{display: editingCost ? '' : 'none'}}>
				<form onSubmit={handleSubmit(onSubmit)}>
					<div className="row section-title">
						<h3 className="col-md-7 col-xs-5">Cost</h3>
						<div className="col-md-5 col-xs-7">
							<span className="text-button" onClick={() => toggleEdit(false)}>Cancel</span>
							<button className="btn btn-sm btn-climbcation submit-button" disabled={isSubmitting}>Submit Changes</button>
						</div>
					</div>
					<div className="row">
						<div className="col-md-5">
							<label>What food options are available in {location?.name}?</label>
							{foodOptionOptions?.map((foodOption: FoodOptionOption, index) => (<div key={foodOption.id}>
								<input name="foodOptions" className="control-input-checkbox" ref={register} type="checkbox" id={ foodOption.name } value={JSON.stringify(foodOption)} />
								<label className={classNames(["control control--checkbox"])} htmlFor={foodOption.name}>
									<div className="control__indicator"></div>
									<span className="gray">{foodOption.name}</span>
								</label>
							</div>))
							}	
						</div>
						<div className="col-md-7">
							<div className="row">
								<label>Cost for a single meal?</label>
								<div className="row">
									{selectedFoodOptions?.map(x => JSON.parse(x)).map(foodOption => (<div key={`selectedfood${foodOption.id}`} className="col-md-6">
										<label className="center-block gray">{foodOption.name}</label>
										<div className="btn-group btn-group-sm center-block btn-group-toggle">
											{foodOption.ranges.map((costRange: string, index) => (
												<React.Fragment key={costRange}>
													<input type="radio" name={`foodOptionCosts.${foodOption.name}`} value={costRange} ref={register} id={`foodCost${foodOption.name}${costRange}`} style={{display: 'none'}}/> 
													<label className={classNames("btn btn-sm btn-default")} htmlFor={`foodCost${foodOption.name}${costRange}`} style={{borderTopLeftRadius: index === 0 ? '3px' : '', borderBottomLeftRadius: index === 0 ? '3px' : ''}}>
														{costRange}	
													</label>
												</React.Fragment>
											))}
										</div>
									</div>))}
								</div>
							</div>
						</div>
					</div>
					<div className="row">
						<div className="col-md-6">
							<label>Any other common expenses in {location?.name}?</label>
							<div className="form-group">
								<textarea placeholder="ex. red rock requires entrance fee" className="form-control" rows={3} ref={register} name="commonExpensesNotes"></textarea>
							</div>
						</div>
						<div className="col-md-6">
							<label>Any tips on saving money in {location?.name}?</label>
							<div className="form-group">
								<textarea placeholder="ex. Mama's chicken is a great restaurant that is very cheap, and trader joes is a cheap but healthy grocery store... you should also hitchhike a bunch since it's easy here" className="form-control" rows={3} ref={register} name="savingMoneyTips"></textarea>
							</div>
						</div>
					</div>
				</form>
			</div>
		</div>

	);
}
function FlightCostComponent({location}: PropLocation) {
	let storedIataCode = localStorage.getItem('airport') ? JSON.parse(localStorage.getItem('airport'))?.iata_code : 'DEN';
	let [selectedAirport, setSelectedAirport] = useState<airport>(allAirports.find(x => x.iata_code === storedIataCode) || allAirports[0]);
	let airportCode = selectedAirport?.iata_code;
	let forceUpdate = useForceUpdate();
    let lowPrice: {date: string, cost: number} = {date: '11/11', cost: 999999999999999999999999};

    let getFlightQuotes = async (originAirportCode: string) => {
		if (selectedAirport && location?.slug) {
			return axios.post('/api/collect_locations_quotes', {slugs: [location?.slug], origin_airport: selectedAirport.iata_code}).then(function(response){
				let flightQuotes = response.data;
				let locationQuote = flightQuotes.find(x => x.id === location.id);
				location.flightPrice = locationQuote;
				location.referral = locationQuote?.referral;
				forceUpdate();
			});

		}
	}
	
	useEffect(() => {
		getFlightQuotes(airportCode);
	}, [location])
	useEffect(() => {
		getFlightQuotes(airportCode);
	}, [selectedAirport])
	return (
		<div className="col-md-6">
			<div className="well climbcation-well">
				<h3>One way flight cost(
					<div className="airport-wrapper inline">
						<AirportAutocomplete selectedAirport={selectedAirport} setSelectedAirport={setSelectedAirport} style={{display: 'inline-block'}}/>
					</div>
					to {location?.airport_code})
				</h3>
                <div className="location-airfare">
                    {airportCode === location?.airport_code ? 
                        <div className="sorry-message">
                            <h4>This Destination's airport is the same as the one you are flying out of.</h4>
                        </div>
                        :
                    (location?.flightPrice === undefined ? <img className="loading-quote" src={loading} alt="loading" /> :
                    (transformQuotesToChartData(location?.flightPrice?.quotes, lowPrice).length ? 
                    <>
                        <div>
                            <a href={location?.referral} target="_blank">One Way cost from {airportCode} to {location?.airport_code}<img src={skyscannerLogo} alt="skyscanner" /></a>
                        </div>
                        <ResponsiveContainer width="95%" height={125}>
                            <LineChart data={transformQuotesToChartData(location?.flightPrice?.quotes, lowPrice)} >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Line type="monotone" dataKey="cost" stroke="#3c7e91" />
                            </LineChart>
                        </ResponsiveContainer>
                    </>
                    : 
                    <div className="sorry-message">
                        <h4>We're sorry, we couldn't find any flight information from {airportCode} to { location.airport_code }.</h4><br /><h5>You may have better luck searching with a bigger airport or for specific dates on your preferred airline's website.</h5>
                    </div>))}
                    {
                        lowPrice?.cost !== 999999999999999999999999 && <div>
                            <div className="row">
                                <span className="col-md-6">
                                <label>Airline Prices(hover to see prices) </label>
                                </span>
                                <span className="col-md-6 text-right">
                                    <a href={location?.referral}><h4 className="text-gray">Low of ${lowPrice.cost} on {lowPrice.date}</h4></a>
                                </span>
                            </div>
                        </div>
                    }
                </div>
			</div>
		</div>

	);
}
function LocationComponent() {
	let {slug} = useParams();
	let [location, setLocation] = useState<Location>();
	let [posts, setPosts] = useState<Post[]>([]);
	let forceUpdate = useForceUpdate();
	let {accommodations, foodOptions, transportations} = useEditables();
	let [showToast, setShowToast] = useState(false);

	let regetPosts = () => {
		axios(`/api/threads/${slug}?destination_category=true`).then((resp) => {
			setPosts(resp.data);
		});
	}


	useEffect(() => {
		axios(`/api/location/${slug}`).then((resp) => {
			let locationToSet = new Location(resp.data.location);
			locationToSet.isPrimary = true;
			locationToSet.nearby = resp.data.nearby;
			locationToSet.miscSections = resp.data.sections;

			setLocation(locationToSet);
		});
		regetPosts();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [slug]);

	let addMiscSection = () => {
		if (location?.miscSections?.find(x => !x.id)) {
			// misc section found... maybe we scroll to it in TODO
			scroller.scrollTo('miscSectionnewMisc', {
				duration: 800,
				delay: 0,
				smooth: "easeInOutQuart",
				offset: 0 
			});
		} else {
			location?.miscSections.push({title: '', body: ''});
			forceUpdate();
		}
	}

	return (
		<>
		<Toast onClose={() => setShowToast(false)} show={showToast} delay={3000} autohide style={{position: 'fixed', zIndex: 1000, top: 40, right: 20}} >
			<Toast.Body>Your edit has been submitted and will be approved by a moderator shortly!</Toast.Body>
		</Toast>

		<section className="location-info-container">
			<InfoHeader location={location}></InfoHeader>
			<div className="container-fluid">
				<div className="row">
					<GettingIn location={location} transportationOptions={transportations} saveCallback={setShowToast} />
					<Accommodations location={location} accommodationOptions={accommodations} saveCallback={setShowToast} />
				</div>
				<div className="row">
					<CostComponent location={location} foodOptionOptions={foodOptions} saveCallback={setShowToast}></CostComponent>
					<FlightCostComponent location={location} />
				</div>
				<div>
					<div className="climbcation-well well has-header">
						<div className="well-header">
							<h3>{location?.name} Miscellaneous</h3>
						</div>
						<div className="well-content">
							<div className="misc-container">
								{location?.miscSections?.map(misc => <React.Fragment key={misc.id || 'newMisc'}><MiscSectionComponent forceUpdate={forceUpdate} location={location} miscSection={misc} saveCallback={setShowToast} /></React.Fragment>)}
							</div>
						</div>
					</div>
				</div>
				<div >
					<div className="row">
						<div className="col-md-8">
							<div className="well location-posts-container">	
								<PostInput threadId={posts && posts[0]?.forum_thread_id} slug={location?.slug} callBack={regetPosts} />
								<Thread posts={posts} editCallback={regetPosts} />
							</div>
						</div>
						<div className="col-md-4">
							<div className="info-container add-section">
								<div className="text-center">
									<h3 className="text-center">Is something about {location?.name} missing?</h3>
									<div className="btn btn-climbcation text-center" onClick={() => addMiscSection()}>Add New Misc Category</div>
								</div>
							</div>

						</div>
					</div>
				</div>
			</div>

		</section>

		</>
	);
}

export function MiscSectionComponent({location, miscSection, forceUpdate, className, saveCallback}: PropLocation) {
	let [preview, setPreview] = useState<boolean>(Boolean(miscSection?.id));
	let [isSaving, setIsSaving] = useState<boolean>(false);
	let [miscState, setMiscState] = useState<MiscSection>(miscSection);
	let [originalBody, setOriginalBody] = useState<string>(miscSection?.body);
	let [originalTitle, setOriginalTitle] = useState<string>(miscSection?.title);
	let cancelEdit = () => {
		if (miscSection.id) {
			miscSection.body = originalBody;
			miscSection.title = originalTitle;
		} else {
			location.miscSections = location?.miscSections?.filter(x => x !== miscSection);
		}
		forceUpdate()
		setPreview(true);
	}

	let handleChange = (e, key) => {
		miscSection[key] = e.target.value;
		setMiscState(Object.assign({}, miscSection));
	}

	let saveChanges = async () => {
		if (!isSaving) {
			setIsSaving(true);
			try {
				let response = await axios.post(`/api/locations/${location?.id}/sections`, {
					locationId: location?.id,
					section: {
						id: miscSection?.id,
						title: miscSection?.title,
						body: miscSection?.body,
					}
				});
				if (response.data.new_id && response.data.new_id !== '') {
					miscSection.id = response.data.new_id;
					forceUpdate();
				} else {
					saveCallback && saveCallback(true);
				}
				setOriginalBody(miscSection.body);
				setOriginalTitle(miscSection.title);
				setPreview(true);
			} catch (err) {
				alert('error submitting change')
			}
			setIsSaving(false);
		}

	}
	return (
		<div className={classNames("misc-section", className)}>
			<Element name={`miscSection${miscSection.id || 'newMisc'}`}>
				{!preview && <div>
					<div className="row">
						<div className={classNames("col-md-12")}>
							<div className="form-group">
								<label>Section Title</label>
								<input type="text" placeholder="ex. Social Scene" className="form-control" onChange={(e) => handleChange(e, 'title')} value={miscSection.title}/>
							</div>
						</div>
					</div>
					<div className="row">
						<div className={classNames("col-md-12")}>
							<div className="form-group">
								{!miscSection?.id && <label>Section Description</label>}
								<textarea  placeholder="The best place to meet climbers is at the Fatolitis snack bar, this is a great bar for a post climbing spray session as well" className="form-control" rows={miscSection?.id?3:6} onChange={(e) => handleChange(e, 'body')}  value={miscSection.body}></textarea>
							</div>
							{
								location?.id && (<>
									<div className={classNames("btn btn-default btn-climbcation pull-right", {disabled: isSaving})} onClick={() => saveChanges()}>
										Save
									</div>
									<div className="text-button pull-right pad-top" onClick={() => cancelEdit()}>
										Cancel
									</div>
									</>
								)
							}
						</div>
					</div>
				</div>}


				{preview && <div> 
					<h3 className="inline">{miscSection?.title}</h3> <span className="text-button" onClick={() => setPreview(false)}>Edit</span>
					<p className="text-gray info-text preserve-line-breaks"><Linkify>{miscSection?.body}</Linkify></p>
				</div>}
			</Element>
		</div>
	);

}

export default LocationComponent;