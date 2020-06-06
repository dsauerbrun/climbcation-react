/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useContext, useState, useEffect } from 'react';
import { authContext, User } from '../common/useAuth';
import { useForm } from "react-hook-form";
import {
    useRouteMatch
} from "react-router-dom";
import { Modal } from 'react-bootstrap';
import Toast from 'react-bootstrap/Toast';

interface LoginForm {
    email: string;
    username?: string;
    password: string;
}

let signUpValid = (email:string , password: string, username: string) => {
    function emailIsValid (email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    }

    let invalidString = '';
    if (!password || password.length < 6) {
        invalidString += `Password must be at least 6 characters <br />`;
    }
    if (!username || username.length < 3) {
        invalidString += `Username must be at least 3 characters <br />`;
    }

    if (!email || !emailIsValid(email)) {
        invalidString += `Must enter a valid email <br />`;
    }

    if (invalidString == '') {
        return true;
    } else {
        return invalidString;
    }
}

export function Login(props) {
	const auth = useContext(authContext);
    let user: User = auth.user;
    let [signUpEnabled, setSignUpEnabled] = useState<boolean>(false)
    let [forgotPasswordEnabled, setForgotPasswordEnabled] = useState<boolean>(false)
    let [formAlerts, setFormAlerts] = useState({authError: null, success: false});
    let successCallback = props.successCallback;

	let { register, handleSubmit, watch, errors, formState, setValue } = useForm<LoginForm>({});
	let {dirty, isSubmitting, touched, submitCount} = formState;
	const onSubmit = async (data: LoginForm) => {
        if (signUpEnabled) {
            await signUp(data.email, data.password, data.username);
        } else if (forgotPasswordEnabled) {
            await resetPassword(data.username);
        } else {
            await signin(data.username, data.password);
        }
	};
    
    function changeFormAlerts(obj) {
        setFormAlerts({...obj, ...formAlerts});
    }
	let getState = () => {
		return encodeURIComponent(window.location.href);
	}

	let signin = async (username: string, password: string) => {
        changeFormAlerts({authError: null});

		try {
			await auth.login(username, password);
            successCallback && successCallback();
		} catch (err) {
			if (err.status === 400) {
				changeFormAlerts({authError: 'Invalid Username or Password'});
			} else {
				changeFormAlerts({authError: `Unknown Error: ${err.data}`});
			}
		}
    }

	let resetPassword = async (username: string) => {
		changeFormAlerts({authError: null});
		try {
			await auth.resetPassword(username);
            successCallback && successCallback('A link to reset your password has been sent to your email!');
		} catch (err) {
            changeFormAlerts({authError: err});
		}
    }
    
	let signUp = async (email: string, password: string, username: string) => {
		changeFormAlerts({authError: null});
		let signUpFormValid = signUpValid(email, password, username);
		if (signUpFormValid === true) {
			try {
				await auth.signup(email, username, password);
                successCallback && successCallback('A link to verify your account has been sent to your email!');
			} catch (err) {
                changeFormAlerts({authError: err});
			}
			
		} else {
			// form not valid
            changeFormAlerts({authError: signUpFormValid});
		}
		
    }
    let match = useRouteMatch();  
    useEffect(() => {
        if (props?.signUpEnabled ||  match.url === '/signup') {
            setSignUpEnabled(true);
        } else {
            setSignUpEnabled(false);
        }
    }, [])
    
    return (
        <>
        <div id="loginModal" className="login-modal" >
                        {formAlerts.authError && <div className="alert alert-warning alert-dismissable">
                            <button type="button" className="close" onClick={() => changeFormAlerts({authError: null})}>&times;</button>
                            <div>{formAlerts.authError}</div>
                        </div>}
                        {!signUpEnabled && !forgotPasswordEnabled && <div>
                            <div className="row">
                                <div className="col-md-12">
                                    <div className="external-sign-in">
                                        <a href={`https://www.climbcation.com/auth/facebook?state=${getState()}`} className="fb connect" target="_self">
                                            Sign In with Facebook
                                        </a>
                                        <a href={`https://www.climbcation.com/auth/google_oauth2?state=${getState()}`} target="_self">
                                            <div className="google-btn">
                                                <div className="google-icon-wrapper">
                                                    <img className="google-icon-svg" alt="google icon" src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"/>
                                                </div>
                                                <p className="btn-text"><b>Sign In with Google</b></p>
                                            </div>
                                        </a>
                                    </div>
                                </div>
                            </div>
                            <hr />
                            <div className="row">
                                <form className="col-md-12" onSubmit={handleSubmit(onSubmit)}>
                                    <div >
                                        <label>Email</label>
                                        <input className="form-control" type="text" ref={register({required: true, minLength: 3})} name="username" />
                                        <div className="password-label">
                                            <label>Password</label>
                                            <a onClick={() => setForgotPasswordEnabled(true)}>Forgot password?</a>
                                        </div>
                                        <input className="form-control" type="password" ref={register({required: true, minLength: 3})} name="password" />
                                        <div className="go-row">
                                            <div>
                                                Don't have an account? <a onClick={() => setSignUpEnabled(true)}>Sign Up!</a>
                                            </div>
                                            <div>
                                                <button className="btn btn-primary pull-right" disabled={isSubmitting}>
                                                    Go!
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                        }
                        
                        {forgotPasswordEnabled && <div>
                            <div className="row">
                                <div className="col-md-12">
                                    <form onSubmit={handleSubmit(onSubmit)}>
                                        <label>Email</label>
                                        <input className="form-control" type="text" ref={register({required: true, minLength: 3})} name="username"/>
                                        <div className="go-row">
                                            <div>
                                                <button className="btn btn-primary pull-right" disabled={isSubmitting}>
                                                    Reset Password
                                                </button>
                                                <div className="btn btn-default pull-right" onClick={() => !isSubmitting && setForgotPasswordEnabled(false)} style={{marginRight: '10px'}}>
                                                    Cancel
                                                </div>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>}
                        {signUpEnabled && !forgotPasswordEnabled && <div>
                            <div className="row">
                                <div className="col-md-12">
                                    <div className="external-sign-in">
                                    <a href={`https://www.climbcation.com/auth/facebook?state=${getState()}`} className="fb connect" target="_self">
                                        Sign Up with Facebook
                                    </a>
                                    <a href={`https://www.climbcation.com/auth/google_oauth2?state=${getState()}`} target="_self">
                                        <div className="google-btn">
                                        <div className="google-icon-wrapper">
                                            <img className="google-icon-svg" src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"/>
                                        </div>
                                        <p className="btn-text"><b>Sign Up with Google</b></p>
                                        </div>
                                    </a>
                                    </div>
                                </div>
                            </div>
                            <hr />
                            <div className="row">
                                <div className="col-md-12">
                                    <form onSubmit={handleSubmit(onSubmit)}>
                                        <label>Email</label>
                                        <input className="form-control" type="text" ref={register({required: true, minLength: 3})} name="email" />
                                        <label>Username</label>
                                        <input className="form-control" type="text" ref={register({required: true, minLength: 3})} name="username" />
                                        <label>Password</label>
                                        <input className="form-control" type="password" ref={register({required: true, minLength: 3})} name="password" />
                                        <div className="go-row">
                                            <div>
                                                Already have an account? <a onClick={() => setSignUpEnabled(false)}>Sign In!</a>
                                            </div>
                                            <div>
                                                <button className="btn btn-primary pull-right" disabled={isSubmitting}>
                                                Go!
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>}
        </div>
        </>
    );
}

export function LoginModal({signUpEnabled, setSignUpEnabled, showLoginModal, setShowLoginModal}) {
    let [showToast, setShowToast] = useState({showing: false, message: ''});
    return (
        <>
		<Toast onClose={() => setShowToast({showing: false, message: ''})} show={showToast?.showing} delay={3000} autohide style={{position: 'fixed', zIndex: 1000, top: 40, right: 20}} >
            <Toast.Body>{showToast.message}</Toast.Body>
		</Toast>
        <Modal show={showLoginModal} onHide={() => setShowLoginModal(false)} id="loginModal" className="modal">
            <Modal.Header>
                <h4 className="modal-title">{ signUpEnabled ? 'Sign Up': 'Log In' }</h4>
                <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={() => setShowLoginModal(false)}><span aria-hidden="true">&times;</span></button>
            </Modal.Header>
            <Modal.Body>
                <Login signUpEnabled={signUpEnabled} successCallback={
                    (toastMessage: string = null) => {
                        setShowLoginModal(false)
                        if (toastMessage) {
                            setShowToast({showing: true, message: toastMessage});
                        }
                    }
                }/>
            </Modal.Body>
            <Modal.Footer>
                <div className="btn btn-default" onClick={() => setShowLoginModal(false)}>Cancel</div>
            </Modal.Footer>
        </Modal>
        </>
    );
}


/*
$scope.username = null;


	$scope.showSignUp = function() {
		$rootScope.signUpEnabled = true;
	}

	$scope.showLogin = function() {
		$rootScope.signUpEnabled = false;
	}





	async function init() {
		await authService.getUser();
	}

	init();*/