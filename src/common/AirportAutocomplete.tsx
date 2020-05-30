import React, { ChangeEvent } from 'react';
import useAutocomplete from '@material-ui/lab/useAutocomplete';
import styles from './AirportAutocomplete.module.scss';
import parse from 'autosuggest-highlight/parse';
import match from 'autosuggest-highlight/match';
import {airport, allAirports} from './airportsList';


function ListItems(groupedOptions: any[], getOptionProps: any, inputProps: any) {
    return (
        <>
        {
            groupedOptions.map((option, index) => {
                const matches = match(option.name, inputProps.value);
                const parts = parse(option.name, matches);
                return (
                    <li {...getOptionProps({ option, index })}>
                        {
                            parts.map((part, index) => (
                                <span key={index} style={{ fontWeight: part.highlight ? 700 : 400 }}>
                                    {part.text}
                                </span>
                            ))
                        }
                    </li>
                )})
        }
        </>
    );
}

export default function AirportAutocomplete(props: any) {
	let {selectedAirport, setSelectedAirport}: {selectedAirport: airport, setSelectedAirport: Function} = props;

	const {
		getRootProps,
		getInputProps,
		getListboxProps,
		getOptionProps,
		groupedOptions,
	} = useAutocomplete<airport>({
	id: 'airportAutocomplete',
	options: allAirports,
	defaultValue: selectedAirport,
	getOptionLabel: (option: airport) => option.name,
	getOptionSelected: (option: airport, value: airport) => {
		return option.iata_code === value.iata_code;
	},
	onChange: (event: ChangeEvent<{}>, value: airport | null, reason: string): void => {
		localStorage.setItem('airport', JSON.stringify(value));
		setSelectedAirport(value)
	},
    filterOptions: (options: airport[], {inputValue}) => {
        let airport = inputValue.toLowerCase();
        let matchingAirports: airport[] = allAirports.filter(x => x.iata_code.toLowerCase() === airport || x.name.toLowerCase().includes(airport) || x.keywords?.toLowerCase().includes(airport) || x.municipality?.toLowerCase().includes(airport));
		matchingAirports = matchingAirports.sort((a, b) => {
			function hasKeywordThatStartsWith(keywords: string | undefined, airportString: string) {
				let splitKeywords: string[] = keywords?.split(',') || [];

				return Boolean(splitKeywords.find(keyword => keyword.trim().startsWith(airportString)));
			}

			// now sort where iata matches go to top
			// then sort where name starts with
			// then sort where municipality starts with
			// then sort where keywords starts with
			// then sort alphabetically

			if (a.iata_code.toLowerCase() === airport) {
				return -1;
			} else if (b.iata_code.toLowerCase() === airport) {
				return 1;
			} else if (a.name.toLowerCase().startsWith(airport)) {
				return -1;
			} else if (b.name.toLowerCase().startsWith(airport)) {
				return 1;
			} else if (a.municipality?.toLowerCase().startsWith(airport)) {
				return -1;
			} else if (b.municipality?.toLowerCase().startsWith(airport)) {
				return 1;
			} else if (hasKeywordThatStartsWith(a.keywords?.toLowerCase(), airport)) {
				return -1
			} else if (hasKeywordThatStartsWith(b.keywords?.toLowerCase(), airport)) {
				return 1
			} else {
				return a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1;
			}
		}).slice(0, 4).map(x => ({
			name: x.name,
            iata_code: x.iata_code,
		}));

        return matchingAirports;
    }
    });

	return (
		<div style={props.style}>
			<div {...getRootProps()}>
			<input className="form-control" {...getInputProps()} />
			</div>
			{groupedOptions.length > 0 ? (
			<ul className={styles.listbox} {...getListboxProps()}>
                {ListItems(groupedOptions, getOptionProps, getInputProps())}
			</ul>
			) : null}
		</div>
	);

}
