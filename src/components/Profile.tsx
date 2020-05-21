import React, { useContext } from 'react';
import { authContext, User } from '../common/useAuth';
import { useForm } from "react-hook-form";

interface ProfileForm {
	username: string;
}

function Profile () {
	const auth = useContext(authContext);
	let user: User = auth.user;
	let { register, handleSubmit, watch, errors } = useForm<ProfileForm>();
	const onSubmit = data => {
		auth.changeUsername(data.username)
	};

	return (
		<div className="profile-form">
			<div className="climbcation-well well reset-form">
				<h1>Choose a new username</h1>
				<div className="alert alert-warning alert-dismissable" ng-if="submitError">
					<button type="button" className="close" ng-click="submitError = null">&times;</button>
					<div ng-bind-html="submitError"></div>
				</div>
				<div className="alert alert-success alert-dismissable" ng-if="submitSuccess">
					<button type="button" className="close" ng-click="submitSuccess = null">&times;</button>
					<div>Your information has been saved!</div>
				</div>
				<form onSubmit={handleSubmit(onSubmit)}>
					<div>
						<label>Username</label>
						<input name="username" ref={register({required: true, minLength: 3})} className="form-control" type="text" ng-model="username" />
						<div style={{width: '100%', display: 'flex', justifyContent: 'flex-end', marginTop: '10px'}}>
							<button className="btn btn-primary" ng-click="changeUsername()" ng-disabled="submitting">
								Submit!
							</button>
						</div>
					</div>
				</form>
			</div>
		</div>	
	);
}

export default Profile;