import {useState, useEffect} from 'react';
import {FilterParams} from '../classes/FilterParams';

export interface filterHook {
	filterState?: FilterParams | null,
	setFilterState?(FilterParams: FilterParams): void,
	addCount?(): void,
}

function useFilterParams() {
	let [filterState, setFilterState] = useState<FilterParams>(new FilterParams());
	let addCount = () => {
		// testing function
		console.log(filterState ,filterState.startMonth)
		let newParams = new FilterParams(filterState);
		newParams.startMonth.month = newParams.startMonth.month+1;

		setFilterState(newParams);
	}

	useEffect(() => {

	}, [])

	return {filterState, setFilterState, addCount};
}

export default useFilterParams;


/*

var LocationsGetter = this;
	var monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
	//var LocationsGetter = {};
	LocationsGetter.flightQuotes = null;
	LocationsGetter.maps = {};
	var filter = {};
	LocationsGetter.locations = [];
	LocationsGetter.unpaginatedLocations = [];
	LocationsGetter.pageNum = 1;
	LocationsGetter.filterTimer = null;
	LocationsGetter.mapFilter = {};
	LocationsGetter.markerMap = {};
	LocationsGetter.filter = filter;
	LocationsGetter.scrollLock = false;
	LocationsGetter.appliedFilters = [];
	filter['climbing_types'] = [];
	filter.grades = {};
	filter['accommodations'] = [];

	filter['continents'] = [];
	filter.rating = [];
	filter['sort'] = [];
	filter['search'] = '';
	filter.solo_friendly = null;
	filter.no_car = null;
	filter.start_month = 1;
	filter.end_month = 12;

	filter.start_month_name = monthNames[filter.start_month - 1];
	filter.end_month_name = monthNames[filter.end_month - 1];;
	LocationsGetter.mapFilter['northeast'] = {};
	LocationsGetter.mapFilter['northeast']['longitude'] = null;
	LocationsGetter.mapFilter['northeast']['latitude'] = null;
	LocationsGetter.mapFilter['southwest'] = {};
	LocationsGetter.mapFilter['southwest']['longitude'] = null;
	LocationsGetter.mapFilter['southwest']['latitude'] = null;
	LocationsGetter.loading = false;

	var sort = {};
	sort['grade'] = [];
	let filterKeys = {}

	

	LocationsGetter.setAppliedFilters = async function() {
		if (!filterKeys.climbTypes) {
			await $http.get('/api/filters').then(function(resp){
				var data = resp.data;
				filterKeys.climbTypes = data.climbTypes;
				filterKeys.accommodations = data.accommodations;
				filterKeys.grades = data.grades;
			});
		}
		let filterList = [];
		let filter = LocationsGetter.filter;
		filter.accommodations && filter.accommodations.forEach(function(accommodation) {
			let title = _.findKey(filterKeys.accommodations, function(accommodationId) {return accommodationId == accommodation});
			filterList.push({title: title, id: accommodation, type: 'accommodations'});
		});

		filter.climbing_types && filter.climbing_types.forEach(function(climbingType) {
			filterList.push({title: climbingType, id: climbingType, type: 'climbing_types'});
		});

		filter.rating && filter.rating.forEach(function(rating) {
			filterList.push({title: rating == 1 ? '1 Star' : `${rating} stars`, id: rating, type: 'rating'});
		})

		if (filter.grades) {
			for (let grade in filter.grades) {
				let climbingType = _.findKey(filterKeys.grades, function(type) {return type.type.id == grade});
				let climbingTypeObj = filterKeys.grades[climbingType];
				let maxGradeId = filter.grades[grade].reduce(function(a, b) {
				    return Math.max(a, b);
				});
				let maxGrade = climbingTypeObj.grades.find(x => x.id == maxGradeId);
				filterList.push({title: `${climbingType}: ${maxGrade.grade}`, id: grade, type: 'grades'});
			}
		}

		if (filter.search && filter.search != '') {
			filterList.push({title: `Keyword: ${filter.search}`, id: 'search', type: 'search'});
		}

		if (filter.start_month != 1 || filter.end_month != 12) {
			filterList.push({title: `${filter.start_month_name.substring(0, 3)} - ${filter.end_month_name.substring(0,3)}`, id: 'months', type: 'months'})
		}

		if (filter.solo_friendly && filter.solo_friendly === true) {
			filterList.push({title: `Solo Traveler Friendly`, id: 'solo_friendly', type: 'solo_friendly'});
		}

		if (filter.no_car && filter.no_car === true) {
			filterList.push({title: `No Car Needed`, id: 'no_car', type: 'no_car'});
		}

		LocationsGetter.appliedFilters = filterList;
		$rootScope.$apply();
	}

	LocationsGetter.removeAppliedFilter = function(appliedFilter) {
		if (appliedFilter.type == 'accommodations' || appliedFilter.type == 'climbing_types') {
			LocationsGetter.filter[appliedFilter.type] = LocationsGetter.filter[appliedFilter.type].filter(x => x != appliedFilter.id);
		} else if (appliedFilter.type == 'grades') {
			delete LocationsGetter.filter.grades[appliedFilter.id];
		} else if (appliedFilter.type == 'search') {
			LocationsGetter.filter.search = '';
		} else if (appliedFilter.type == 'months') {
			LocationsGetter.filter.end_month = 12;
			LocationsGetter.filter.start_month = 1;
			LocationsGetter.filter.end_month_name = 'December';
			LocationsGetter.filter.start_month_name = 'January';
		} else if (appliedFilter.type == 'solo_friendly') {
			LocationsGetter.filter.solo_friendly = null;
		} else if (appliedFilter.type == 'no_car') {
			LocationsGetter.filter.no_car = null;
		} else if (appliedFilter.type == 'rating') {
			LocationsGetter.filter[appliedFilter.type] = LocationsGetter.filter[appliedFilter.type].filter(x => x != appliedFilter.id);
		}

		let appliedFilterIndex = LocationsGetter.appliedFilters.findIndex(x => x.id == appliedFilter.id && x.type == appliedFilter.type);
		LocationsGetter.appliedFilters.splice(appliedFilterIndex, 1);
		LocationsGetter.setFilterTimer(0);
	}

	LocationsGetter.isButtonActive = function(filterArray, filterValue) {
		if (filterValue == 'empty') {
			return filter[filterArray] && filter[filterArray].length == 0
		} else {
			return filter[filterArray] && filter[filterArray].indexOf(filterValue) > -1;
		}
		
	}

	LocationsGetter.reloadMapMarkers = function() {
		if (LocationsGetter.unpaginatedLocations.length != 0) {
			//redo map points
			for (let key in LocationsGetter.maps) {
				let currentMap = LocationsGetter.maps[key];
				
				let existingMarkerIds = currentMap.map.markers.map(x => x.details.location.id);
				LocationsGetter.unpaginatedLocations.filter(x => existingMarkerIds.indexOf(x.id) == -1).forEach(function(unpagLocation) {
					var clickFunc = null;
					if (key == 'large') {
						clickFunc = async function(e) {
							var exists = LocationsGetter.locations.find(x => x.id == unpagLocation.id);
							!exists && await LocationsGetter.addSingleLocation(unpagLocation.slug);
							$('#infinite-scroll-container').animate({
				          scrollTop: $('#location-item-' + unpagLocation.id).offset().top - $('#infinite-scroll-container').offset().top  + $('#infinite-scroll-container').scrollTop()
				      }, 1000);
						}
					} else {
						clickFunc = async function(e) {
							$location.path('/location/' + e.details.location.slug);
							$rootScope.$apply();
						}
					}
					LocationsGetter.markerMap[unpagLocation['slug'] + key] = addMarker(currentMap.map, unpagLocation['latitude'], unpagLocation['longitude'], unpagLocation, true, clickFunc);
					
					let options = {opacity: .5};
					

					LocationsGetter.markerMap[unpagLocation['slug'] + key].setOptions(options);
				});

				currentMap.map.markers.filter(x => LocationsGetter.unpaginatedLocations.map(y => y.id).indexOf(x.details.location.id) == -1).forEach(function(marker) {
					currentMap.map.removeMarker(marker);
				})

				// we set firstMapLoad to false when the zoom_changed watch catches the fitBounds call 
				if (currentMap.firstMapLoad && key == 'small') {
					var allowedBounds = new google.maps.LatLngBounds(
					    new google.maps.LatLng(85, -180),           // top left corner of map
						new google.maps.LatLng(-85, 180)            // bottom right corner
					);

					var k = 5; 
					var n = allowedBounds.getNorthEast().lat() - k; 
					var e = allowedBounds.getNorthEast().lng() - k; 
					var s = allowedBounds.getSouthWest().lat() + k; 
					var w = allowedBounds.getSouthWest().lng() + k; 
					var neNew = new google.maps.LatLng( n, e ); 
					var swNew = new google.maps.LatLng( s, w ); 
					boundsNew = new google.maps.LatLngBounds();
					boundsNew.extend(neNew);
					boundsNew.extend(swNew); 
					currentMap.map.fitBounds(allowedBounds);
				}
			}
		}
	}

	LocationsGetter.setCachedFilter = function(cachedFilter, cachedMapFilter) {
		LocationsGetter.clearFilters();
		let retVal = false;
		if (cachedFilter && moment(cachedFilter.date).diff(moment(), 'days') < 1) {
			filter = cachedFilter;
			LocationsGetter.filter = filter;
			retVal = true;
		}

		if (cachedMapFilter && moment(cachedMapFilter.date).diff(moment(), 'days') < 1) {
			//LocationsGetter.mapFilter = cachedMapFilter;
			//retVal = true;
		}
		LocationsGetter.setFilterTimer(0);
	
		return true;
	}

	LocationsGetter.setFilterTimer = function(seconds) {
		LocationsGetter.cancelFilterTimer();
		LocationsGetter.filterTimer = $timeout(function() {
			filter.date = moment().format('YYYY-MM-DD');
			mapFilter.date = moment().format('YYYY-MM-DD');
			localStorageService.set('filter', filter);
			localStorageService.set('mapFilter', mapFilter);
			LocationsGetter.pageNum = 1;
			LocationsGetter.locations = [];
			LocationsGetter.getNextPage();
			LocationsGetter.setAppliedFilters();
		}, seconds*1000);
	}

	LocationsGetter.cancelFilterTimer = function() {
		LocationsGetter.filterTimer && $timeout.cancel(LocationsGetter.filterTimer);
	}

	LocationsGetter.clearFilters = function() {
		this.mapFilter = {};
		this.markerMap = {};
		this.pageNum = 1;
		filter['climbing_types'] = [];
		filter.grades = {};
		filter['accommodations'] = [];

		filter['continents'] = [];
		filter.rating = [];
		filter['sort'] = [];
		filter['search'] = '';
		filter['start_month'] = 1;
		filter['end_month'] = 12;
		filter.solo_friendly = null;
		filter.no_car = null;
		filter.start_month_name = monthNames[filter.start_month - 1];
		filter.end_month_name = monthNames[filter.end_month - 1];;
		this.mapFilter['northeast'] = {};
		this.mapFilter['northeast']['longitude'] = null;
		this.mapFilter['northeast']['latitude'] = null;
		this.mapFilter['southwest'] = {};
		this.mapFilter['southwest']['longitude'] = null;
		this.mapFilter['southwest']['latitude'] = null;
		this.loading = false;

		sort['grade'] = [];
	};

	LocationsGetter.toggleFilterButton = function(filterArray,filterValue){
		if(filterValue != 'sort' && $.inArray(filterValue,filter[filterArray]) != -1){
			//remove item from filter
			filter[filterArray].splice($.inArray(filterValue,filter[filterArray]), 1);
		}
		else if( filterValue == 'All'){
			filter[filterArray] = [];
		}
		else{
			if (!filter[filterArray]) {
				filter[filterArray] = [];
			}
			filter[filterArray].push(filterValue);
		}
		LocationsGetter.setFilterTimer(1);
	};

	LocationsGetter.filterByMonth = function(startMonth, endMonth) {
		filter.start_month = startMonth;
		filter.end_month = endMonth;
		filter.start_month_name = monthNames[filter.start_month - 1];
		filter.end_month_name = monthNames[filter.end_month - 1];;
		LocationsGetter.setFilterTimer(1.5);
	}

	LocationsGetter.filterByGrade = function(typeId, grades) {
		if (grades == null) {
			// resetting grade filter
			delete filter.grades[typeId];
		} else {
			filter.grades[typeId] = grades;
		}
		LocationsGetter.setFilterTimer(1);
	}

	LocationsGetter.filterByQuery = function(eventItem){
		filter['search'] = eventItem;
		LocationsGetter.setFilterTimer(0);
	}
	LocationsGetter.getFlightQuotes = function(slugs, originAirportCode, callback){
		return $http.post('/api/collect_locations_quotes', {slugs: slugs, origin_airport: originAirportCode}).then(function(response){
			LocationsGetter.flightQuotes = response.data;
			callback && callback();
			return response.data;
		});
	};

	LocationsGetter.getNextPage = function() {
		LocationsGetter.scrollLock = true;
		return LocationsGetter.getLocations().then(function(locations) {
			LocationsGetter.pageNum++;
			LocationsGetter.scrollLock = false;
			return locations;
		});
	};

	LocationsGetter.setSorting = function(sortBy, asc) {
		if (sortBy == 'distance') {
			navigator.geolocation.getCurrentPosition(
				function(position) {
					LocationsGetter.myLat = position.coords.latitude;
					LocationsGetter.myLong = position.coords.longitude;
					filter.sort ={distance: {latitude: LocationsGetter.myLat, longitude: LocationsGetter.myLong}};
					LocationsGetter.setFilterTimer(0);
				},
				function() {
					console.error('error getting location(probably blocked)');
					alert('Need location permission to sort by distance, ' +
						'if you arent given the option to grant permission, ' +
						'it is probably because your browser doesnt support non-ssl geolocation requests... the webmaster is a cheap bastard ' +
						'and doesnt want to spend $20/mo, go to https://climbcation.herokuapp.com and it should work just fine');
				}
			);
		} else {
			filter.sort = {};
			filter.sort[sortBy] = {asc: asc};
			LocationsGetter.setFilterTimer(0);
		}
		
	}

	LocationsGetter.getLocations = function() {
		LocationsGetter.loading = true;
		return $http.post('/api/filter_locations', {filter: filter, mapFilter: LocationsGetter.mapFilter, page: LocationsGetter.pageNum}).then(function(response) {
			LocationsGetter.loading = false;
			if (JSON.stringify(response.data.unpaginated.map(x => x.id).sort()) != JSON.stringify(LocationsGetter.unpaginatedLocations.map(x => x.id).sort()) && response.data.unpaginated.length != 0) {
				LocationsGetter.unpaginatedLocations = response.data.unpaginated;
			}
			var promiseLocations = response.data.paginated;
			LocationsGetter.locations || (LocationsGetter.locations = []);
			$.each(promiseLocations, function(key, promiseLocation) {
				LocationsGetter.addLocationToList(promiseLocation);
			});
			if (_.size(promiseLocations) == 0) {
				LocationsGetter.scrollEnded = true;
			} else {
				LocationsGetter.scrollEnded = false;
			}
			LocationsGetter.reloadMapMarkers();
			return response.data;
		});
	};

	LocationsGetter.addSingleLocation = function(slug) {
		return $http.get('/api/location/' + slug).then(function(resp) {
			LocationsGetter.addLocationToList(resp.data.location, true);
		});
	};

	LocationsGetter.addLocationToList = function(location, unshift) {
		var exists = LocationsGetter.locations.find(function(locationIter) {
			return locationIter.id == location.id;
		});
		if (unshift) {
			!exists && LocationsGetter.locations.unshift(location);
		} else {
			!exists && LocationsGetter.locations.push(location);
		}
		
	};*/