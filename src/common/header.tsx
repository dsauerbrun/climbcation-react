import React, { useContext, useState } from 'react';
import Col from 'react-bootstrap/Col';
import {Row, Dropdown, Navbar, Toast} from 'react-bootstrap';
import {authContext, User} from './useAuth';
import './header.scss';
import headerLogo from '../images/climbcation-header-logo.png';
import {
  Link
} from "react-router-dom";
import {LoginModal} from '../components/Login';
import { useMediaQuery } from 'react-responsive'
import axios from 'axios';


function Header() {
	const auth = useContext(authContext);
	let user: User = auth.user;
	let [openLogin, setOpenLogin] = useState(false);
	let [showToast, setShowToast] = useState<{message: string}>();
	let [openSignUp, setOpenSignUp] = useState(false);
	const isMobile = useMediaQuery({ maxWidth: 767 })
	let showSignUp = () => {
		setOpenLogin(true);	
		setOpenSignUp(true);
	}

	let showLogin = () => {
		setOpenLogin(true);	
		setOpenSignUp(false);
	}

	let deleteAccount = async () => {
		try {
			await auth.deleteAccount();
			setShowToast({message: 'Your account has been successfully deleted!'});
		} catch (err) {
			alert('Failed to delete account, please contact info@climbcation.com');
		}
	}

	let changePassword = async () => {
		try {
			await auth.resetPassword(user.email)
			setShowToast({message: 'Please check your email for a password change link'});
		} catch (err) {
			alert('Failed to delete account, please contact info@climbcation.com');
		}
	}

	return (
		<>
		<Toast onClose={() => setShowToast(null)} show={showToast?.message?.length > 0} delay={3000} autohide style={{position: 'fixed', zIndex: 1000, top: 40, right: 20}} >
			<Toast.Body>{showToast?.message}</Toast.Body>
		</Toast>
		<Navbar className="navbar home navbar-inverse" expand="lg">
			{isMobile && <div>
				<Link className="navbar-brand" style={{width: '80%', padding: '5px 15px', cursor: 'pointer'}} to="/home">
					<img src={headerLogo} style={{width: 'inherit'}} alt="logo"/>
				</Link>
				<Navbar.Toggle aria-controls="basic-navbar-nav" bsPrefix="mobile-toggler navbar-toggler" />
				<Navbar.Collapse id="basic-navbar-nav">
						<ul className="nav navbar-nav">
							{user?.username && <li>Welcome {user?.username}</li>}
							<li role="separator" className="divider"></li>
							{user?.username ? <><li role="presentation" ><a href="home" role="menuitem" onClick={() => changePassword()}>Change Password</a></li>
							<li role="presentation" ><Link to="/profile">Change Username</Link></li>
							<li role="presentation" ><div className="anchor" onClick={() => deleteAccount()}>Delete Account</div></li>
							<li role="presentation" ><a href="/api/user/logout" target="_self">Logout</a></li></> :
							<li><div className="anchor" onClick={() => showLogin()} style={{display: 'inline'}}>Login</div> / <div className="anchor" onClick={() => showSignUp()} style={{display: 'inline'}}>Signup</div></li>
							}
							<li role="separator" className="divider"></li>
							<li><Link to="/new-location">Submit a New Location</Link></li>
							<li><Link to="/about">What is Climbcation?</Link></li>
							<li><Link to="/terms">Terms/Policies</Link></li>
							<li><a href="mailto:info@climbcation.com">Email Me!</a></li>
							<li><a href="https://www.instagram.com/climbcation/?ref=badge" className="contact-link"><img className="instagram-badge" src="//badges.instagram.com/static/images/ig-badge-24.png" alt="Instagram" /></a></li>
							<li><a href="https://www.facebook.com/climbcation"><div className="fb-like display-inline-block contact-link" data-href="https://www.facebook.com/climbcation" data-width="20" data-layout="button" data-action="like" data-size="small" data-show-faces="false" data-share="false"></div></a></li>
						</ul>

				</Navbar.Collapse>

			</div>}





			{!isMobile && <div className="container d-block" style={{width: '90%', margin: '0 auto', maxWidth: 'inherit'}}>
				<Row>
				<Col md={2} className="nav-link text">
					<Link to="/new-location">Submit a New Location</Link>
				</Col>
				<Col md={2} className="nav-link text">
					<Link to="/about">About</Link>
					<span> | </span>
					<Link to="/terms">Terms/Policies</Link>
				</Col>
				<Col md={4} className="nav-link">
					<Link className="navbar-logo" to="/home">
						<img src={headerLogo} alt="logo" />
					</Link>
				</Col>
				<Col md={2} className="nav-link text">
					{
						user ? 
							<Dropdown>
								<Dropdown.Toggle id="dropdownMenu12" as="div" style={{cursor: 'pointer'}}>
									Welcome {user?.username}	
								</Dropdown.Toggle>
								<Dropdown.Menu>
									<Dropdown.Item onClick={() => changePassword()}>Change Password</Dropdown.Item>
									<Dropdown.Item as={Link} to="/profile">Change Username</Dropdown.Item>
									<Dropdown.Item className="anchor" onClick={() => deleteAccount()}>Delete Account</Dropdown.Item>
									<Dropdown.Item href="/api/user/logout" target="_self">Logout</Dropdown.Item>
								</Dropdown.Menu>	
							</Dropdown>
						:
							<div><div onClick={() => showLogin()} style={{cursor: 'pointer', display: 'inline-block'}} >Login</div> / <div style={{display: 'inline-block', cursor: 'pointer'}} onClick={() => showSignUp()}>Signup</div></div>
					}
				</Col>
				<Col md={2} className="nav-link text">
					<a href="mailto:info@climbcation.com" style={{fontSize: '18px', verticalAlign: 'sub'}}><span className="glyphicon glyphicon-envelope"></span></a>
					<a href="https://www.instagram.com/climbcation/?ref=badge" className="contact-link"><img className="instagram-badge" src="//badges.instagram.com/static/images/ig-badge-24.png" alt="Instagram" /></a>
					<div className="fb-like display-inline-block contact-link" data-href="https://www.facebook.com/climbcation" data-width="20" data-layout="button" data-action="like" data-size="small" data-show-faces="false" data-share="false"></div>
				</Col>
			</Row>
			</div>}
	  </Navbar>
				<LoginModal showLoginModal={openLogin} setShowLoginModal={setOpenLogin} signUpEnabled={openSignUp} setSignUpEnabled={setOpenSignUp} />
	</>
	);
}

export default Header;