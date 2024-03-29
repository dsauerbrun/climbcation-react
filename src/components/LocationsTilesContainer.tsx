/* eslint-disable react/jsx-no-target-blank */
import React, {useContext} from 'react';
import {LocationsContext } from './Home';
import Location from '../classes/Location';
import classNames from 'classnames';
import InfiniteScroll from "react-infinite-scroll-component";
import { IconTooltip } from '../common/HelperComponents';
import { LocationsFetch } from './useLocationsFetcher';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import {
  Link
} from "react-router-dom";
import skyscannerLogo from '../images/skyscannerinline.png';
import loading from "../images/climbcation-loading.gif";

export const transformQuotesToChartData = (flightQuotes, lowPrice) => {
    let data = [];
    if (flightQuotes) {
        let months = Object.keys(flightQuotes).sort((a, b) => parseInt(a) < parseInt(b) ? -1 : 1);
        months.forEach(month => {
            let monthQuotes = flightQuotes[month];
            Object.keys(monthQuotes).sort((a, b) => parseInt(a) < parseInt(b) ? -1 : 1).forEach(day => {
                data.push({name: `${month}/${day}`, cost: flightQuotes[month][day]})
                if (!lowPrice || lowPrice.cost > parseInt(flightQuotes[month][day])) {
                    if (!lowPrice) {
                        throw new Error('Error setting low price');
                    }
                    lowPrice.date = `${month}/${day}`;
                    lowPrice.cost = parseInt(flightQuotes[month][day]);
                }
            })
        })
    }
    return data;
}

export function LocationTile(props: {location: Location, setHoveredLocation: Function, airportCode: string, index?: number}) {
    let location: Location = props.location;
    let setHoveredLocation = props.setHoveredLocation;
    let airportCode = props.airportCode; 
    let lowPrice: {date: string, cost: number} = {date: '11/11', cost: 999999999999999999999999};

    return (
        <div className={`location-item`} onMouseEnter={() => setHoveredLocation(location)} onMouseLeave={() => setHoveredLocation(null)}>
            <div className={classNames("location-card", {'left-card': props.index % 2 === 0, 'right-card': props.index % 2 === 1})}>
                <div className="location-card-info">
                    <div className="row">
                        <div className="col-md-8 location-list-thumb-container">
                            <Link to={"/location/" + location.slug }>
                                <img className="location-list-thumb" src={ location.home_thumb || '' } alt="location thumbnail" />	
                                <div className="location-list-thumb-title">
                                    <h3 className="text-gray">{ location.name }</h3>
                                    <h5><strong>{ location.country }</strong></h5>
                                </div>
                            </Link>
                        </div>
                        <div className="col-md-4 location-card-attributes">
                            <div className="col-xs-6 col-md-12">
                                <label>Climbing Types</label>
                                {
                                    location.climbing_types.map(x => (<img alt="climbing type {x.name}" key={x.name} className="icon" title={x.name} src={x.url} />))
                                }
                            </div>
                            <div className="col-xs-6 col-md-12">
                                <label>Best Seasons</label>
                                <p className="text-gray info-text">{ location.date_range }</p>
                            </div>
                            <div className="col-xs-6 col-md-12">
                                <label>Climbing Difficulty</label>
                                {
                                    location.grades.map(grade => (
                                        <p className={classNames(['text-gray', 'info-text', {'multiple-grades': location.grades.length > 1}])} key={grade.id}>
                                            {location.grades.length > 1 && <img src={grade.type.url} alt="grade" className="grade-climbing-type-icon" /> }
                                            {grade.grade} 
                                            {location.grades.length === 1 ? ' and harder':''}
                                        </p>
                                    ))
                                }
                                {location.grades.length > 1 && <div className="text-gray info-text multiple-grades"> and harder</div>}
                            </div>
                            <div className="col-xs-6 col-md-12">
                                <label>Vehicle Requirement</label>
                                <IconTooltip 
                                    tooltip={location.noCarNeeded() ? 'You can make a trip work here without a vehicle.' : 'Having a vehicle is recommended.'}
                                    dom={
                                        location.noCarNeeded() ? <div style={{width: '20px'}}>
                                            <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 24 24" width="20" className="icon" style={{fill: '#3c7e91'}}><path d="M0 0h24v24H0z" fill="none"/><path d="M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9L7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3C14.8 12 16.8 13 19 13v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1L6 8.3V13h2V9.6l1.8-.7"/></svg>
                                        </div> :
                                        <div style={{width: '20px'}} >
                                            <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 24 24" width="20" className="icon" style={{fill: '#3c7e91'}}><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/><path d="M0 0h24v24H0z" fill="none"/></svg>
                                        </div>}
                                ></IconTooltip>
                            </div>
                            <div className="col-xs-6 col-md-5" style={{float: 'left'}}>
                                <label>Rating</label>
                                <IconTooltip tooltip={location.ratingName()} 
                                dom={
                                    <span className="list-item-rating-container">
                                        <span className="glyphicon glyphicon-star" ></span>
                                        <span className={classNames(['glyphicon', 'glyphicon-star', {'glyphicon-star-empty': location.rating < 2}])} ></span>
                                        <span className={classNames(['glyphicon', 'glyphicon-star', {'glyphicon-star-empty': location.rating < 3}])} ></span>
                                    </span>
                                }
                                ></IconTooltip>
                            </div>
                            <div className="col-xs-6 col-md-7" style={{float: 'left'}}>
                                <label>Solo Friendly</label>
                                <IconTooltip
                                    tooltip={location.solo_friendly === null ? 'We\'re not sure if this place is solo friendly. Email info@climbcation.com if you can help us out with this one' : (location.solo_friendly ? 'You should be able to find partners easily if you\'re traveling solo.' : 'You may have trouble finding partners if you are traveling solo.')}
                                    dom={location.solo_friendly === null ? 
                                    <p className="text-gray info-text" style={{marginBottom: '0'}}>Maybe <i className="glyphicon glyphicon-info-sign"></i></p> 
                                    :  <p className="text-gray info-text" style={{marginBottom: '0'}}>{location.solo_friendly ? 'Yes' : 'No'} <i className="glyphicon glyphicon-info-sign"></i></p>}
                                ></IconTooltip>
                            </div>
                        </div>
                    </div>
                </div>
                {/*<div className="location-airfare">
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
                            <LineChart data={transformQuotesToChartData(location?.flightPrice?.quotes, lowPrice)}>
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
                </div>*/}
            </div>
        </div>

    );
}


function LocationTilesContainer({setHoveredLocation, airportCode}) {
	let {nextLocations, noMoreLocations, locations} = useContext<LocationsFetch>(LocationsContext);

   return (
        <InfiniteScroll 
            dataLength={locations.length}
            next={nextLocations}
            hasMore={!noMoreLocations}
            scrollThreshold={.9}
            loader={
                <div className="col-md-12 bottom-padding text-center" style={{minHeight: '500px'}}>
                    <h4><img src={loading} alt="loading" /><strong>Loading more crags!</strong></h4>
                </div>
            }
            endMessage={
                <div className="col-md-12 bottom-padding text-center">
                    <h4><strong>No More Crags Available :(</strong></h4>
                    <h4><strong>Try broadening your filters</strong></h4>
                </div>
            }
        >
            <div className="locations-window">
                {
                    locations?.map((location: Location, index: number) => (<LocationTile key={location.id} index={index} location={location} setHoveredLocation={setHoveredLocation} airportCode={airportCode}/>))
                }
            </div>
        </InfiniteScroll>
    );
}

export default LocationTilesContainer;