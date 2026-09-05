import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Link, useLocation } from 'react-router-dom';

function Verify () {
	let location = useLocation();
	let params = new URLSearchParams(location.search);
	let queryId = params.get('id');
	let [verifying, setVerifying] = useState<boolean>(true);
	let [error, setError] = useState<string>(null);
	let requested = useRef<boolean>(false);

	useEffect(() => {
		//verifying spends the token, so a second request would come back invalid and turn a
		//successful verification into an error on screen. latch it to one call per mount.
		if (requested.current) {
			return;
		}
		requested.current = true;

		let verify = async () => {
			if (!queryId) {
				setError('This verification link is missing its token.');
				setVerifying(false);
				return;
			}

			try {
				await axios.get('/api/verify?id=' + encodeURIComponent(queryId));
			} catch (err: any) {
				//only a 400 carries a message meant for the user. anything else is a 404 html
				//page, a 500, or a dropped connection, none of which are worth rendering raw.
				let body = err?.response?.data;
				let usable = err?.response?.status === 400 && typeof body === 'string' && body;
				setError(usable ? body : 'We could not verify your account. Please try the link from your email again.');
			}
			setVerifying(false);
		};
		verify();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<div className="profile-form">
			<div className="climbcation-well well reset-form">
				{ verifying &&
					<div>
						<h1>Verifying your account</h1>
						<p className="text-gray info-text">One moment while we confirm your email address.</p>
					</div>
				}
				{ !verifying && error &&
					<div>
						<h1>We couldn't verify your account</h1>
						<div className="alert alert-warning">{error}</div>
						<Link to="/">Back to finding a climbcation</Link>
					</div>
				}
				{ !verifying && !error &&
					<div>
						<h1>Your account is verified</h1>
						<div className="alert alert-success">Thanks! Your email address has been confirmed.</div>
						<Link to="/login">Log in</Link>
					</div>
				}
			</div>
		</div>
	);
}

export default Verify;
