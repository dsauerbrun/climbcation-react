/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect, useState } from 'react';
import {useParams, Link} from "react-router-dom";
import axios from 'axios';
import classNames from 'classnames';
import Location, {Accommodation, FoodOption, Transportation} from '../classes/Location';
import Linkify from 'react-linkify';
import { useForm } from "react-hook-form";

interface AccommodationOption extends Accommodation {
	ranges: string[];
}

interface FoodOptionOption extends FoodOption {
	ranges: string[];
}

interface TransportationOption extends Transportation {
	ranges: string[];
}

interface PropLocation {
	location: Location;
	transportationOptions?: TransportationOption[];
	accommodationOptions?: AccommodationOption[];
	foodOptionOptions?: FoodOptionOption[];
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
								<div className={classNames("nearby-locations", {expanded: nearbyShow})}>
									{nearbyShow && <div className="nearby-display">
										{location.nearby?.map((nearbyLoc) => (<div className="nearby-location">
											<Link to={`/location/${nearbyLoc.slug}`}>{ nearbyLoc.name }</Link> <span className="text-gray bold">({nearbyLoc.distance} mi away)</span>
											{nearbyLoc?.climbing_types.map(nearbyType => (<img src={nearbyType.url} className="icon" alt="climbing type"/>))}
										</div>))}
									</div>}
									<a className="toggle" onClick={() => setNearbyShow(!nearbyShow)}>{ nearbyShow? '[-] Hide Nearby Locations':'[+] Show Nearby Locations' }</a>
								</div>

								<div className="map-info-window " id="showMapInfoWindow" style={{display: 'none'}}>
									{/*
									<div className="location-card map-info-window-arrow-bottom">
										<div className="location-card-info">
											<div className="row">
												<div className="col-md-8 location-list-thumb-container">
													<a ng-href="/location/{{ hoveredLocation.location.slug }}">
														<img className="location-list-thumb" ng-src="{{ hoveredLocation.location['home_thumb'] }}">	
														<div className="location-list-thumb-title">
															<h3 className="text-gray">{{ hoveredLocation.location['name'] }}</h3>
														</div>
													</a>

												</div>
												<div className="col-md-4 location-card-attributes">
													<div className="col-xs-12 col-md-12">
														<label>Climbing Types</label>
														<img ng-repeat="type in hoveredLocation.location['climbing_types']" ng-src="{{ type['url'] }}" className='icon' title="{{ type['name'] }}">
													</div>
													<div className="col-xs-12 col-md-12">
														<label>Best Seasons</label>
														<p className="text-gray info-text">{{ hoveredLocation.location['date_range']}}</p>
													</div>
													<div className="col-xs-12 col-md-12">
														<label>Rating</label>
														<span data-template-url="views/tooltips/startooltip.tpl.html" data-animation="am-flip-x" bs-tooltip="helperService.getRatingName(hoveredLocation.location.rating)">
															<span className="glyphicon glyphicon-star" ></span>
															<span className="glyphicon glyphicon-star" ng-class="{'glyphicon-star-empty': hoveredLocation.location.rating < 2}"></span>
															<span className="glyphicon glyphicon-star" ng-class="{'glyphicon-star-empty': hoveredLocation.location.rating < 3}"></span>
														</span>
													</div>
												</div>
											</div>
										</div>
									</div>
									*/}
								</div>

								<div id="nearby-map" className="">
									
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
											location?.solo_friendly === null ? (<p className="text-gray info-text">Maybe <i className="glyphicon glyphicon-info-sign" data-template-url="views/tooltips/startooltip.tpl.html" data-animation="am-flip-x" bs-tooltip="'We\'re not sure if this place is solo friendly. Email info@climbcation.com if you can help us out with this one'"></i></p>) : (
											<p className="text-gray info-text" >{location?.solo_friendly ? 'Yes' : 'No'} <i className="glyphicon glyphicon-info-sign" data-template-url="views/tooltips/startooltip.tpl.html" data-animation="am-flip-x" bs-tooltip="locationData.solo_friendly ? 'You should be able to find partners easily if you\'re traveling solo.' : 'You may have trouble finding partners if you are traveling solo.'"></i></p>)
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
											<div style={{width: '20px'}} data-template-url="views/tooltips/startooltip.tpl.html" data-animation="am-flip-x" bs-tooltip="'You can make a trip work here without a vehicle.'">
												<svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 24 24" width="20" className="icon" style={{fill: '#3c7e91'}}><path d="M0 0h24v24H0z" fill="none"/><path d="M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9L7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3C14.8 12 16.8 13 19 13v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1L6 8.3V13h2V9.6l1.8-.7"/></svg>
											</div>
										) : (
											<div style={{width: '20px'}} data-template-url="views/tooltips/startooltip.tpl.html" data-animation="am-flip-x" bs-tooltip="'Having a vehicle is recommended.'">
												<svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 24 24" width="20" className="icon" style={{fill: '#3c7e91'}}><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/><path d="M0 0h24v24H0z" fill="none"/></svg>
											</div>
										)}
									</div>
									<div className="col-md-3 col-xs-3">
										<label>Rating</label>
										<span data-template-url="views/tooltips/startooltip.tpl.html" data-animation="am-flip-x" ng-bs-tooltip="helperService.getRatingName(locationData.rating)">
											<span className="glyphicon glyphicon-star"></span>
											<span className={classNames("glyphicon glyphicon-star", {'glyphicon-star-empty': location?.rating < 2})}></span>
											<span className={classNames("glyphicon glyphicon-star", {'glyphicon-star-empty': location?.rating < 3})} ng-class="{'glyphicon-star-empty': locationData.rating < 3}"></span>
										</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
}

function GettingIn({location, transportationOptions}: PropLocation) {
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
		console.log(data, data.walking_distance, Boolean(data.walking_distance));
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
				console.log('responding here', response)
				if (response.status === 200) {
					axios.get('/api/location/' + location?.slug).then(function(response) {
						location.transportations = response?.data?.location?.transportations;
						location.getting_in_notes = response.data.location.getting_in_notes;
						location.best_transportation = response.data.location.best_transportation;
						location.walking_distance = response.data.location.walking_distance;
						setEditingGettingIn(false);
						/*ngToast.create({
							additionalClasses: 'climbcation-toast',
							content: editMessage
						});*/
					});
				}
			});
		}
	};

	const toggleEdit = (shouldEdit: boolean) => {
		if (shouldEdit) {
			let filteredTransportationOptions = transportationOptions?.filter(x => location?.transportations.find(y => y.id === x.id));
			let bestTransportation = filteredTransportationOptions?.find(x => x.id === location?.best_transportation.id);
			console.log('val checker', filteredTransportationOptions, location?.walking_distance, bestTransportation)
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
					Upon arrival, you <strong>{location?.walking_distance ? 'can' : 'cannot'} {location?.walking_distance && <i className="glyphicon glyphicon-info-sign" data-template-url="views/tooltips/startooltip.tpl.html" data-animation="am-flip-x" bs-tooltip="'May include alternative methods of transportation such as hitchhiking if there is a strong hitchhiking culture in the area.'"></i>}</strong> get to where you need without a car/motorbike. (eg. crag, shelter, food)
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
							<i className="glyphicon glyphicon-info-sign text-gray" data-template-url="views/tooltips/startooltip.tpl.html" data-animation="am-flip-x" bs-tooltip="'May include alternative methods of transportation such as hitchhiking if there is a strong hitchhiking culture in the area.'"></i>
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
function Accommodations({location, accommodationOptions}: PropLocation) {
	interface AccommodationForm {
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
	return (
		<div></div>
	);
}

function LocationComponent() {
	let {slug} = useParams();
	let [location, setLocation] = useState<Location>();
	interface AttributeOptions {
		accommodations?: AccommodationOption[];
		foodOptions?: FoodOptionOption[];
		transportations?: TransportationOption[];
	}
	let [{accommodations, foodOptions, transportations}, setEditables] = useState<AttributeOptions>({});

	let populateEditables = (location: Location) => {
		axios.get('/api/get_attribute_options').then(function(data){
			var respData = data.data
			setEditables({accommodations: respData.accommodations, foodOptions: respData.food_options, transportations: respData.transportations})
		}).then(function() {
			/*_.forEach(location.accommodations, function(accommodation) {
				$scope.locationObj.accommodations[accommodation.id] = { id: accommodation.id, cost: accommodation.cost};
			})
			$scope.locationObj.accommodationNotes = location.accommodation_notes;
			$scope.locationObj.closestAccommodation = location.closest_accommodation;

			_.forEach(location.transportations, function(transportation) {
				$scope.locationObj.transportations[transportation.id] = true;
			});
			location.best_transportation.id && $scope.selectBestTransportation(location.best_transportation.id);
			location.best_transportation.cost && $scope.selectBestTransportationCost(location.best_transportation.cost)
			$scope.locationObj.gettingInNotes = location.getting_in_notes;
			$scope.locationObj.walkingDistance = location.walking_distance;

			_.forEach(location.food_options, function(foodOption) {
				$scope.locationObj.foodOptions[foodOption.id] = true;
				foodOption.cost && $scope.selectFoodOptionDetail(foodOption.id, foodOption.cost);
			});
			$scope.locationObj.commonExpensesNotes = location.common_expenses_notes
			$scope.locationObj.savingMoneyTips = location.saving_money_tip;*/
		});
	}
	useEffect(() => {
		axios(`/api/location/${slug}`).then((resp) => {
			console.log(resp)	
			let locationToSet = new Location(resp.data.location);
			locationToSet.nearby = resp.data.nearby;

			setLocation(locationToSet);
			populateEditables(locationToSet);
		});
		axios(`/api/threads/${slug}?destination_category=true`).then((resp) => {
			console.log(resp)	
		});
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	return (
		<>
		<div id="saveSuccessModal" className="modal">
			<div className="modal-dialog">
				<div className="modal-content">
					<div className="modal-header">
						<button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
						<h4 className="modal-title">Thank you!</h4>
					</div>
					<div className="modal-body">
						<p>Your change has been submitted!</p>
					</div>
					<div className="modal-footer">
						<button type="button" className="btn btn-default" data-dismiss="modal">Close</button>
					</div>
				</div>
			</div>
		</div>

		<section className="location-info-container">
			<InfoHeader location={location}></InfoHeader>
			<div className="container-fluid">
				<div className="row">
					<GettingIn location={location} transportationOptions={transportations}></GettingIn>
				</div>
			</div>

		</section>

		</>
	);
}

export default LocationComponent;