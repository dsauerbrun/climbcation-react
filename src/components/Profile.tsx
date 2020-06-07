/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useState, useEffect } from 'react';
import { authContext, User } from '../common/useAuth';
import { useForm } from "react-hook-form";

interface ProfileForm {
	username: string;
}

function Profile () {
	const auth = useContext(authContext);
	let user: User = auth.user;
	let [formAlerts, setFormAlerts] = useState({error: null, success: false});
	let { register, handleSubmit, formState, setValue } = useForm<ProfileForm>({});
	let {isSubmitting} = formState;
	const onSubmit = async (data) => {
		try {
			await auth.changeUsername(data.username);
			setFormAlerts({error: formAlerts.error, success: true});
		} catch (err) {
			setFormAlerts({error: err, success: formAlerts.success});
		}
	};

	useEffect(() => {
		setValue([{username: user?.username}]);
	}, [user])

	return (
		<div className="profile-form">
			<div className="climbcation-well well reset-form">
				<h1>Choose a new username</h1>
				{ formAlerts.error && 
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
						<label>Username</label>
						<input name="username" ref={register({required: true, minLength: 3})} className="form-control" type="text" />
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

export default Profile;