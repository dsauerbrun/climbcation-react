import React from 'react';
import { Link } from 'react-router-dom';

function NotFound() {
	return (
		<div className="container text-center" style={{marginTop: '40px'}}>
			<h3>We couldn't find that page</h3>
			<p className="text-gray info-text">The link may be broken, or the page may have moved.</p>
			<Link to="/">Back to finding a climbcation</Link>
		</div>
	);
}

export default NotFound;
