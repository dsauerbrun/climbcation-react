import moment from 'moment';

export interface month {
	name: 'January' | 'February' | 'March' | 'April' | 'May' | 'June' | 'July' | 'August' | 'September' | 'October' | 'November' | 'December';
	month: number; 
}

export interface climbType {
	type: string;
	url: string;
}

export interface typeGrades {
	climbingType: string,
	grades: grade[],
	typeHtml: string,
	order: number 
}

export interface grade {
	id?: number,
	grade: string,
	climbingType: string,
	typeId?: number,
	order: number
}

export const months: month[] = [
	{name: 'January', month: 1},
	{name: 'February', month: 2},
	{name: 'March', month: 2},
	{name: 'April', month: 4},
	{name: 'May', month: 5},
	{name: 'June', month: 6},
	{name: 'July', month: 7},
	{name: 'August', month: 8},
	{name: 'September', month: 9},
	{name: 'October', month: 10},
	{name: 'November', month: 11},
	{name: 'December', month: 12},
];

export interface AppliedFilter {
	title: string;
	id: number | string;
	type: 'rating' | 'climbingType' | 'grade' | 'search' | 'month' | 'soloFriendly' | 'noCar';
}

export class FilterParams {
	page: number = 1;
	startMonth: month = {name: 'January', month: 1};
	endMonth: month = {name: 'December', month: 12};
	
	climbingTypesFilter: climbType[] = [];//{type: 'All', url: 'none'}];
	gradesFilter: grade[] = [];
	ratingsFilter: number[] = [];
	searchFilter?: string;
	soloFriendlyFilter: boolean = false;
	noCarFilter: boolean = false;
	date?: moment.Moment;
	northEast = {lat: 90, lng: 180};
	//northEast: google.maps.LatLng = new google.maps.LatLng(90, 180);
	southWest = {lat: -90, lng: -180};
	center = {lat: -3.745, lng: -38.523};
	//southWest: google.maps.LatLng = new google.maps.LatLng(-90, -180);

	constructor(copy?: FilterParams | null) {
		if (copy) {
			Object.assign(this, copy);
		}
	}

	removeAllFilters(): void {
		this.climbingTypesFilter = []; 
		this.gradesFilter = [] 
		this.startMonth = {name: 'January', month: 1};
		this.endMonth = {name: 'December', month: 12};
		this.noCarFilter = false;
		this.ratingsFilter = []; 
		this.searchFilter = null;
		this.soloFriendlyFilter = false;
	}

	removeAppliedFilter(filter: AppliedFilter): void {
		switch (filter.type) {
			case 'climbingType':
				this.climbingTypesFilter = this.climbingTypesFilter.filter(x => x.type !== filter.id);	
				break;
			case 'grade':
				let foundGrade = this.gradesFilter.find(x => x.id === filter.id);
				this.gradesFilter = this.gradesFilter.filter(x => x.typeId !== foundGrade.typeId);
				break;
			case 'month':
				this.startMonth = {name: 'January', month: 1};
				this.endMonth = {name: 'December', month: 12};
				break;
			case 'noCar':
				this.noCarFilter = false;
				break;
			case 'rating':
				this.ratingsFilter = this.ratingsFilter.filter(x => x !== filter.id);
				break;
			case 'search':
				this.searchFilter = null;
				break;
			case 'soloFriendly':
				this.soloFriendlyFilter = false;
				break;		
			default:
				break;
		}
	} 

	get appliedFilters(): AppliedFilter[] {
		let filters: AppliedFilter[] = [];
		this.ratingsFilter.forEach(rating => {
			filters.push({title: rating === 1 ? '1 Star' : `${rating} stars`, id: rating, type: 'rating'});
		})

		this.climbingTypesFilter.forEach(type => {
			if (type.type !== 'All') {
				filters.push({title: type.type, id: type.type, type: 'climbingType'});
			}
		})

		let climbingGradeTypes = [...new Set<number>(this.gradesFilter.map(x => x.typeId))];
		climbingGradeTypes.forEach(typeId => {
			let gradeToApply = this.gradesFilter.sort((a,b) => a.order > b.order ? -1 : 1).find(x => x.typeId === typeId);
			filters.push({title: `${gradeToApply.climbingType}: ${gradeToApply.grade}`, id: gradeToApply.id, type: 'grade'});
		})

		this.searchFilter && filters.push({title: `Keyword: ${this.searchFilter}`, id: 'search', type: 'search'});

		if (this.startMonth.month !== 1 || this.endMonth.month !== 12) {
			filters.push({title: `${this.startMonth.name.substring(0, 3)} - ${this.endMonth.name.substring(0, 3)}`, id: 'months', type: 'month'})
		}

		this.soloFriendlyFilter === true && filters.push({title: 'Solo Traveler Friendly', id: 'soloFriendly', type: 'soloFriendly'});

		this.noCarFilter === true && filters.push({title: 'No Car Needed', id: 'noCar', type: 'noCar'});

		return filters;
	}

	get filterChangedChecker() {
		let filters = {...this};
		filters.page = 0;
		return JSON.stringify(filters);
	}

	get filterUrlObject(): any {
		let gradesObj = {};
		this.gradesFilter.forEach(grade => {
			if (gradesObj[grade.typeId]) {
				gradesObj[grade.typeId].push(grade.id);
			} else {
				gradesObj[grade.typeId] = [grade.id];
			}
		})
		
		return {
			filter: {
				climbing_types: this.climbingTypesFilter.find(x => x.type === 'All') ? [] : this.climbingTypesFilter.map(x => x.type),
				grades: gradesObj, 
				sort: [],
				search: this.searchFilter,
				start_month: this.startMonth.month,
				end_month: this.endMonth.month,
				start_month_name: this.startMonth.name,
				end_month_name: this.endMonth.name,
				rating: this.ratingsFilter,
				solo_friendly: this.soloFriendlyFilter,
				no_car: this.noCarFilter,
				date: moment().format('YYYY-MM-DD'),
			},
			mapFilter: {"northeast":{"longitude": this.northEast.lng,"latitude": this.northEast.lat},"southwest":{"longitude": this.southWest.lng,"latitude": this.southWest.lat}},
			page: this.page 
		}
	};
}