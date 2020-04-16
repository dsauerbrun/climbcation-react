import React from 'react';
import {useParams} from "react-router-dom";

function Location () {

	let {slug} = useParams();
	return (<div>hello location {slug}</div>);
}

export default Location;