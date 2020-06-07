/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect, useState, useRef, useContext } from 'react';
import axios from 'axios';
import Location, {MiscSection, ClimbingType, Grade} from '../classes/Location';
import { useForm } from 'react-hook-form';
import classNames from 'classnames';
import AirportAutocomplete from '../common/AirportAutocomplete';
import { airport } from '../common/airportsList';
import { useEditables, Month, TransportationOption, AccommodationOption, FoodOptionOption } from '../common/useEditables';
import _ from 'lodash';
import { Overlay, Popover, Modal } from 'react-bootstrap';
import cljFuzzy from 'clj-fuzzy';
import { MiscSectionComponent } from './Location';
import { authContext, User } from '../common/useAuth';
import { IconTooltip } from '../common/HelperComponents';
import {Link} from 'react-router-dom';
import loading from '../images/climbcation-loading.gif';
import successImage from '../images/success-icon.png';

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
	accommodationCosts: {Hostel?: string, Hotel?:string, Camping?: string},
	closestAccommodation: string,
	accommodationNotes: string,
	foodOptions: FoodOptionOption[],
	foodOptionCosts: {"Farmer's Market"?: string, "Restaurant"?: string, Grocery?: string},
	commonExpensesNotes: string,
	savingMoneyTips: string,
	miscSections: MiscSection[],
}

function NewLocation () {
	let { register, handleSubmit, watch, formState, setValue, getValues, reset } = useForm<LocationForm>({});
	let {isSubmitting} = formState
	let [page, setPage] = useState<number>(1);
	let {accommodations, climbingTypes, months, grades, foodOptions, transportations} = useEditables();
	let locationName = watch('name');
	let [slug, setSlug] = useState<string>();
	let [locationId, setLocationId] = useState<number>();

	let getMissingFields = (): string[] => {
		let missingFields: string[] = []
		let values = getValues();
		let types = getValues('climbTypes')?.length; 
		!types && missingFields.push('types');
		!getValues('months')?.length && missingFields.push('months');
		(!values.name || values.name === '') && missingFields.push('name');
		(!values.rating || values.rating < 1 || values.rating > 3) && missingFields.push('rating');
		(values.soloFriendly !== true && values.soloFriendly !== false && values.soloFriendly !== null) && missingFields.push('soloFriendly');
		(!values.grades || getValues('grades')?.length !== types) && missingFields.push('grades');

		return missingFields;
	}

	let generalComplete = (): boolean => {
		if (getMissingFields().length) {
			return false;
		} else {
			return true;
		}
	}
	let gettingInComplete = (): boolean => {
		let transportCost = getValues('bestTransportationCost'); 
		return transportCost && transportCost !== '';
	}
	let accommodationComplete = (): boolean => {
		let accommodations = getValues('accommodations');

		return accommodations && accommodations.length > 0;
	}
	let costComplete = (): boolean => {
		let foodOptions = getValues('foodOptions');

		return foodOptions && foodOptions.length > 0;
	}

	let startNewLocation = () => {
		reset();
		setLocationId(null);
		setSlug(null);
		setPage(1);
	}

	const onSubmit = async (data) => {
		console.log('here is data')
		console.log(data);
		if (page !== 5) {
			setPage(page + 1);
		} else {
			//submit
			if (!generalComplete()) {
				setShowError(true);
			} else if (!isSubmitting) {
				let accommodationsWithRanges = data.accommodations?.map(accommodation => {
					let accommodationWithRange = {id: accommodation.id, name: accommodation.name, cost: data.accommodationCosts && data.accommodationCosts[accommodation.name]};
					return accommodationWithRange;
				});

				let climbingTypesWithGrades = data.climbTypes?.map(climbType => {
					let typeGrade = data.grades?.find(x => x.type.id === climbType.id)?.id;
					let climbTypeWithGrade = {id: climbType.id, name: climbType.name, grade_id: typeGrade};
					return climbTypeWithGrade;
				})

				let foodOptionsWithCosts = data.foodOptions?.map(foodOption => {
					let foodOptionWithCost = {id: foodOption.id, name: foodOption.name, cost: data.foodOptionCosts && data.foodOptionCosts[foodOption.name]}
					return foodOptionWithCost;
				})

				let reqObj = {
					name: data.name,
					country: data.country,
					airport: data.airport?.iata_code,
					months: data.months,
					accommodations: accommodationsWithRanges || [],
					climbingTypes: climbingTypesWithGrades || [],
					sections: data.miscSections || [],
					closestAccommodation: data.closestAccommodation,
					foodOptionDetails: foodOptionsWithCosts || [],
					soloFriendly: data.soloFriendly,
					rating: data.rating,
					transportations: data.transportations?.map(x => x.id) || [],
					bestTransportationId: data.bestTransportation?.id,
					bestTransportationCost: data.bestTransportationCost,
					walkingDistance: data.walkingDistance,
					gettingInNotes: data.gettingInNotes,
					accommodationNotes: data.accommodationNotes,
					commonExpensesNotes: data.commonExpensesNotes,
					savingMoneyTips: data.savingMoneyTips  
				};

				try {
					let resp = await axios.post(`/api/submit_new_location`, reqObj);
					setSlug(resp.data.slug);
					setLocationId(resp.data.id);
					setPage(page + 1);
				} catch (err) {
					alert(`error ${err}`);
				}
			}
		}
	}

	let [showError, setShowError] = useState<boolean>(false);

	return (<div id="submit-form">
		<Modal show={showError} id="errorModal" className="modal">
			<Modal.Header>
				<Modal.Title>Woops!</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<p>Looks like you forgot to fill something out in the general section. We're gonna need you to fill out all the starred fields in order to accept this location.</p>
			</Modal.Body>
			<Modal.Footer>
				<div className="btn btn-default" onClick={() => setShowError(false)}>Close</div>
			</Modal.Footer>
		</Modal>


		<div className="text-center">
			<h3 className="title-header">Climbcation Location Creation</h3>
		</div>
		<NewLocationHeader currentPage={page} generalComplete={generalComplete} gettingInComplete={gettingInComplete} accommodationComplete={accommodationComplete} costComplete={costComplete} changePage={setPage} />
		<form onSubmit={handleSubmit(onSubmit)} >
			<div className="form-container">
				<div >
					<div className="row bottom-padding">
						{page === 1 && <h4 className="offset-md-3 col-md-9" >1. General <span className="small-gray">(Don't worry, this is the hardest step!)</span></h4>}
						{page === 2 && <h4 className="offset-md-3 col-md-9" >2. Getting In <span className="small-gray">(How do you get to the crag?)</span></h4>}
						{page === 3 && <h4 className="offset-md-3 col-md-9" >3. Accommodation <span className="small-gray">(Where will you stay when you get there?)</span></h4>}
						{page === 4 && <h4 className="offset-md-3 col-md-9" >4. Cost <span className="small-gray">(How much should you expect to spend on this trip?)</span></h4>}
						{page === 5 && <h4 className="offset-md-3 col-md-9" >5. Other <span className="small-gray">(Anything else you know about { locationName}?)</span></h4>}
						{page === 6 && <h4 className="offset-md-3 col-md-9" >6. Done</h4>}
					</div>
					<div className="row">
						<div className="offset-md-3 offset-xs-1 col-xs-10 col-md-6 well climbcation-well forms-container">
							<div className="well-content">
								<GeneralSection locationName={locationName} register={register} watch={watch} getValues={getValues} setValue={setValue} grades={grades} months={months} climbingTypes={climbingTypes} style={{display: page === 1 ? '' : 'none'}} />
								{page === 2 && <GettingInSection locationName={locationName} register={register} watch={watch} getValues={getValues} setValue={setValue} transportationOptions={transportations} style={{display: page === 2 ? '' : 'none'}}/>}
								{page === 3 && <AccommodationSection locationName={locationName} register={register} watch={watch} getValues={getValues} setValue={setValue} accommodationOptions={accommodations} style={{display: page === 3 ? '' : 'none'}}/>}
								{page === 4 && <CostSection locationName={locationName} register={register} watch={watch} getValues={getValues} setValue={setValue} foodOptions={foodOptions} style={{display: page === 4 ? '' : 'none'}}/>}
								{page === 5 && <MiscSections locationName={locationName} register={register} watch={watch} getValues={getValues} setValue={setValue} style={{display: page === 5 ? '' : 'none'}}/>}
								{page === 6 && <SuccessSection locationName={locationName} locationId={locationId} register={register} watch={watch} getValues={getValues} setValue={setValue} style={{display: page === 6 ? '' : 'none'}}/>}
							</div>
							<div className="col-md-12 well-footer">
								<div className="row">
									{page !== 6 &&<div className="offset-8 col-1 offset-xs-7 col-xs-2" >
										{page !== 1 && page !== 6 && <span className="text-button" onClick={() => setPage(page - 1)} >Back</span>}
									</div>}
									{page < 5 && <div className="col-2 btn btn-climbcation" onClick={() => setPage(page + 1)}>
										<div>Next</div>
									</div>}
									<button className="col-2 btn btn-climbcation" style={{display: page === 5 ? '' : 'none'}} id="publish-button" >
										{!isSubmitting && (<div>Publish</div>)}
										{isSubmitting && <img src={loading} alt="loading"/>}
									</button>
									{page === 6 && <><div className="offset-md-7 col-md-1 right-margin">
										<div className="text-button"><Link to={`/location/${slug}`} target="_blank">Preview</Link></div>
									</div>
									<div className="col-md-3 btn btn-climbcation" onClick={() => startNewLocation()}>
										Submit Another Location
									</div></>}
								</div>
							</div>
						</div>
						<CompletionProgress generalComplete={generalComplete} getMissingFields={getMissingFields}/>
					</div>
					<div className="row">
							<div className="offset-md-3 col-md-6 well climbcation-well tips-container">
								<h4>Tips for adding locations</h4>
								<ul>
									<li>Focus on world class crags, Climbcation is primarily for finding climbing vacation destinations. Do you really want all of us crowding your local crag?</li>
									<li>Sections with an asterisk (*) are required, but the more info you provide the better!</li>
									<li>Excellent location examples with multiple categories: <Link to="/location/bishop" target="_blank">Bishop</Link>, <Link to="/location/baile-herculane" target="_blank">Baile Herculane</Link></li>
								</ul>
							</div>
					</div>
				</div>
			</div>
		</form>



	</div>);
}

interface SectionProps {
	locationName: string,
	locationId?: number,
	register: any,
	watch: any,
	getValues: any,
	setValue: any,
	months?: Month[],
	grades?: Grade[],
	climbingTypes?: ClimbingType[],
	transportationOptions?: TransportationOption[],
	accommodationOptions?: AccommodationOption[],
	foodOptions?: FoodOptionOption[],
	style?: any	
}

function CompletionProgress({generalComplete, getMissingFields}: HeaderProps) {

	let incompletedSectionMessages = (): string[] => {
		let messages = [];
		let missingFields = getMissingFields();
		if (missingFields.length) {
			if (missingFields.indexOf('name') > -1) {
				messages.push('Please enter a location name.');
			}

			if (missingFields.indexOf('types') > -1) {
				messages.push('Please choose at least one climbing discipline.');
			}

			if (missingFields.indexOf('grades') > -1) {
				messages.push('Please choose a grade for all selected climbing disciplines.');
			}

			if (missingFields.indexOf('rating') > -1) {
				messages.push('Please enter a location rating.');
			}

			if (missingFields.indexOf('months') > -1) {
				messages.push('Please choose the months this location is in season.');
			}

			if (missingFields.indexOf('soloFriendly') > -1) {
				messages.push('Please let us know if this is a solo friendly or not.')
			}
		} else {
			messages.push('You\'re all done with the required information and can submit your location NOW! We appreciate any other info you can provide us on the other pages!');
		}

		return messages;
	}
	return (
		<div className="col-md-3 d-none d-sm-block">
			<div className="well climbcation-well forms-container">
				<div className="well-content">
					<h4>{ generalComplete() ? 'Form Completed!' : 'Form Incomplete'}</h4>
					<ul>
						{incompletedSectionMessages()?.map(incompleted => <li key={incompleted}>
							{incompleted}
						</li>)}
					</ul>
				</div>
			</div>
		</div>
	);
}

function SuccessSection({locationName, locationId, register, setValue, getValues, watch, style}: SectionProps) {
	const auth = useContext(authContext);
	let user: User = auth.user;
	let [emailThankYou, setEmailThankYou] = useState(false);
	let [submitterEmail, setSubmitterEmail] = useState<string>();

	let submitEmail = () => {
		axios.post('api/locations/' + locationId + '/email', {email: submitterEmail})
			.then(function(response) {
				setEmailThankYou(true);
			})
	}

	useEffect(() => {
		setEmailThankYou(false);
	}, [locationId])

	return (
		<div className="row">
			<div className="text-center" style={{width: '100%'}}>
				<h3 className="bottom-padding">Congrats!</h3>
				<h4>You've added all the necessary content.</h4>
				<h4 className="bottom-padding">You should see your location available in a day after an admin reviews the content</h4>
				<img src={successImage} alt="success" />
			</div>
			{!user && <div className="col-md-12 row bottom-padding" style={{paddingBottom: '25px'}}>
				<label className="col-md-8 email-prompt">
					Thanks for contributing! An admin might have questions, mind lending us your email?
				</label>
				{!emailThankYou && (<><input name="submitterEmail" placeholder="joe@example.com" className="form-control email-input col-md-3" onChange={(e) => setSubmitterEmail(e.target.value)} value={submitterEmail} />
				<div className="col-md-1">
					<div className="btn btn-climbcation email-btn" onClick={() => submitEmail()}>
						Submit
					</div>
				</div></>)}
				{emailThankYou && <label className="col-md-4 email-prompt">
					Thank you!
				</label>}
			</div>}
			<div className="row bottom-padding">
				<h4 className="col-md-12">Forget some information? Just click on the preview link and edit your location page there!</h4>
			</div>
		</div>

	);

}
function MiscSections({locationName, register, setValue, getValues, watch, style}: SectionProps) {
	useEffect(() => {
		if (!getValues().miscSections) {
			register({ name: 'miscSections' });
			setValue([{miscSections: [{title: '', body: ''}]}])
		}
	}, [register]);


	let addSection = () => {
		let newMiscSections = _.cloneDeep(miscSections);
		newMiscSections.push({title: '', body: ''});
		setValue([{miscSections: newMiscSections}])
	}

	let removeSection = (section: MiscSection) => {
		let newMiscSections = _.cloneDeep(miscSections);
		newMiscSections = newMiscSections.filter(x => x.title !== section.title && x.body !== section.body);

		setValue([{miscSections: newMiscSections}])
	}

	let miscSections: MiscSection[] = watch('miscSections');
	return (
		<>
		<div className="row">
			{miscSections?.map((misc,index) => 
				<div className="col-md-6" key={misc.title+index}>
					<MiscSectionComponent location={(new Location({}))} miscSection={misc} />
					<div className="text-button" onClick={() => removeSection(misc)} >
						Remove Section
					</div>
				</div>
			)}
			<div className="col-md-6">
				<h4>Suggestions</h4>
				<ul>
					<li>Connectivity(wifi/cell reception)</li>
					<li>Rest Day Activities</li>
					<li>Rock Type</li>
					<li>Social Scene(bars, where to find partners, etc...)</li>
					<li>Safety(eg. watch out for theft/scams)</li>
				</ul>
			</div>
		</div>
		<hr />
		<div className="btn btn-primary btn-climbcation" onClick={() => addSection()} style={{margin: '10px 0'}}>
			Add Another Section
		</div>
		</>
	);
}

function CostSection({locationName, register, setValue, getValues, watch, foodOptions, style}: SectionProps) {
	useEffect(() => {
		if (!getValues().foodOptions && !getValues().foodOptionCosts && !getValues().commonExpensesNotes && !getValues().savingMoneyTips) {
			register({ name: 'foodOptions' });
			register({ name: 'foodOptionCosts' });
			register({ name: 'commonExpensesNotes' });
			register({name: 'savingMoneyTips'});
		}
	}, [register]);
	let selectedFoodOptions: FoodOptionOption[] = watch('foodOptions');
	let foodOptionCosts = watch('foodOptionCosts');
	let commonExpensesNotes = watch('commonExpensesNotes');
	let savingMoneyTips = watch('savingMoneyTips');

	let toggleFood = (food: FoodOptionOption) => {
		let newFoods: FoodOptionOption[] = _.cloneDeep(selectedFoodOptions) || [];
		if (newFoods.find(x => x.id === food.id)) {
			newFoods = newFoods.filter(x => x.id !== food.id);
			changeFoodCost(food, '')
		} else {
			newFoods.push(food);

		}

		setValue([{foodOptions: newFoods}]);
	}

	let changeFoodCost = (food: FoodOptionOption, range: string) => {
		if (foodOptionCosts) {
			foodOptionCosts[food.name] = range;
		} else {
			foodOptionCosts = {};
			foodOptionCosts[food.name] = range;
		}

		setValue([{foodOptionCosts: foodOptionCosts}]);
	}

	let foodSelected = (food: FoodOptionOption): boolean => {
		return Boolean(selectedFoodOptions?.find(x => x.id === food.id));
	}

	return (
		<div className="row">
			<div className="col-md-12 border-bottom bottom-padding bottom-margin">
				<div className="row">
					<div className="col-md-6">
						<label className="col-xs-12">What food options are available in {locationName}?</label>
						{foodOptions?.map(food => <div className="col-xs-3 col-md-12" key={food.id}>
							<label className="control control--checkbox" htmlFor={ food.name }>
								<input name={food.name} type="checkbox" id={ food.name } onChange={() => toggleFood(food)} checked={foodSelected(food)} />
								<div className="control__indicator"></div>
								<span className="gray">{food.name}</span>
							</label>
						</div>)}
					</div>
					<div className="col-md-6">
						<div className="row" >
							<label>Cost for a single meal?</label>
							<div className="row">
								{selectedFoodOptions?.map(foodOption => <div className="col-md-6 col-xs-6" key={foodOption.id}>
									<label className="center-block gray">{foodOption.name}</label>
									<div className="btn-group btn-group-sm">
										
										{foodOption.ranges.map((range, index) => <React.Fragment key={range}>
											<input type="radio" name={`foodOptionCosts.${foodOption.name}`} onChange={() => changeFoodCost(foodOption, range)} checked={foodOptionCosts && foodOptionCosts[foodOption.name] === range}  id={`foodOptionCost${foodOption.id}${range}`} style={{display: 'none'}}/>
											<label className="btn btn-sm btn-default" htmlFor={`foodOptionCost${foodOption.id}${range}`} style={{borderTopLeftRadius: index === 0 ? '3px' : '', borderBottomLeftRadius: index === 0 ? '3px' : ''}}>
												{range}
											</label>
										</React.Fragment>)}
									</div>
								</div>)}
							</div>
						</div>
					</div>
				</div>
			</div>
			<div className="col-md-12 row">
				<div className="col-md-6">
					<label>Any other common expenses in {locationName}?</label>
					<div className="form-group">
						<textarea placeholder="ex. red rock requires entrance fee" className="form-control" rows={4} value={commonExpensesNotes} onChange={(e) => setValue([{commonExpensesNotes: e.target.value}])}></textarea>
					</div>
				</div>
				<div className="col-md-6">
					<label>Any tips on saving money in {locationName}?</label>
					<div className="form-group">
						<textarea placeholder="ex. Mama's chicken is a great restaurant that is very cheap, and trader joes is a cheap but healthy grocery store... you should also hitchhike a bunch since it's easy here" className="form-control" rows={4} value={savingMoneyTips} onChange={(e) => setValue([{savingMoneyTips: e.target.value}])}></textarea>
					</div>
				</div>
			</div>
		</div>

	);
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
						<option value="<1 mile">&lt;1 mile</option>
						<option value="1-2 miles">1-2 miles</option>
						<option value="2-5 miles">2-5 miles</option>
						<option value="5+ miles">5+ miles</option>
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
					<IconTooltip tooltip={'May include alternative methods of transportation such as hitchhiking if there is a strong hitchhiking culture in the area.'} 
						dom={<i style={{display: 'block', width: 'fit-content', marginBottom: '10px'}} className="glyphicon glyphicon-info-sign text-gray" ></i>}
					/>
					<div className="btn-group btn-group-sm center-block btn-group-toggle" data-toggle="buttons">
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
				<div className="row"> 
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
					<span className="form-group col-md-4" >
						<label>Country</label>
						<input name="country" ref={register} placeholder="ex. United States" className="form-control" /> 
					</span>

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
	currentPage?: number; 
	generalComplete: Function;
	gettingInComplete?: Function;
	accommodationComplete?: Function;
	costComplete?: Function;
	changePage?: Function;
	getMissingFields?: Function;
}

function NewLocationHeader({currentPage, generalComplete, gettingInComplete, accommodationComplete, costComplete, changePage}: HeaderProps) {
	let maxPages: number = 6;
	let progressBar: number = currentPage * 100 / maxPages; 

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
		progressBar = currentPage * 100 / maxPages;
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
				<a onClick={() => changePage(1)}><strong>1.</strong> <span className="d-none d-sm-inline">General*</span></a>
				<a onClick={() => changePage(2)}><strong>2.</strong> <span className="d-none d-sm-inline">Getting In</span></a>
				<a onClick={() => changePage(3)}><strong>3.</strong> <span className="d-none d-sm-inline">Accommodation</span></a>
				<a onClick={() => changePage(4)}><strong>4.</strong> <span className="d-none d-sm-inline">Cost</span></a>
				<a onClick={() => changePage(5)}><strong>5.</strong> <span className="d-none d-sm-inline">Other</span></a>
				<span><strong>6.</strong> <span className="d-none d-sm-inline">Publish</span></span>
			</div>
		</div>

	);
}

export default NewLocation;