import React, { useContext, useState, useEffect } from 'react';
import { authContext, User } from '../common/useAuth';
import { useForm } from 'react-hook-form';
import {useParams, useLocation} from "react-router-dom";

interface ResetPassForm {
	password: string;
}

function ResetPass () {
	const auth = useContext(authContext);
	let user: User = auth.user;
	let location = useLocation();
	let params = new URLSearchParams(location.search);
	let queryId = params.get('id');
	let [formAlerts, setFormAlerts] = useState({error: null, success: false});
	let { register, handleSubmit, formState, setValue } = useForm<ResetPassForm>({});
	let {isSubmitting} = formState;
	const onSubmit = async (data) => {
		try {
			await auth.changePassword(data.password, queryId);
			setFormAlerts({error: 'Password Successfully Changed!', success: true});
		} catch (err) {
			setFormAlerts({error: err, success: formAlerts.success});
		}
	};

	return (
		<div className="profile-form">
			<div className="climbcation-well well reset-form">
				<h1>Choose a new password</h1>
				{ formAlerts.error && !formAlerts.success && 
					<div className="alert alert-warning alert-dismissable">
						<button type="button" className="close" onClick={() => setFormAlerts({error: null, success: formAlerts.success})}>&times;</button>
						<div>{formAlerts.error}</div>
					</div>
				}
				{ formAlerts.success && 
					<div className="alert alert-success alert-dismissable">
						<button type="button" className="close" onClick={() => setFormAlerts({error: formAlerts.error, success: false})}>&times;</button>
						<div>Your information has been saved!</div>
					</div>
				}
				<form onSubmit={handleSubmit(onSubmit)}>
					<div>
						<label>Password</label>
						<input name="password" ref={register({required: true, minLength: 3})} className="form-control" type="password" />
						<div style={{width: '100%', display: 'flex', justifyContent: 'flex-end', marginTop: '10px'}}>
							<button className="btn btn-primary" disabled={isSubmitting}>
								{isSubmitting ? 'Submitting' : 'Submit!'}
							</button>
						</div>
					</div>
				</form>
			</div>
		</div>	
	);
}

export default ResetPass;