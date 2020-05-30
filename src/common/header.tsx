import React, { useContext, useState } from 'react';
import Nav from 'react-bootstrap/Nav';
import Col from 'react-bootstrap/Col';
import {Row, Dropdown, Navbar, NavDropdown, Form, FormControl, Button} from 'react-bootstrap';
import {authContext, User} from './useAuth';
import './header.scss';
import headerLogo from '../images/climbcation-header-logo.png';
import {
  Link
} from "react-router-dom";
import {LoginModal} from '../components/Login';


function Header() {
	const auth = useContext(authContext);
	let user: User = auth.user;
	let [openLogin, setOpenLogin] = useState(false);
	let [openSignUp, setOpenSignUp] = useState(false);
	let showSignUp = () => {
		setOpenLogin(true);	
		setOpenSignUp(true);
	}

	let showLogin = () => {
		setOpenLogin(true);	
		setOpenSignUp(false);
	}

	return (
		<>
		<Navbar className="navbar home navbar-inverse" expand="lg">
			<div className="d-sm-none">
				<Link className="navbar-brand" style={{width: '80%', padding: '5px 15px', cursor: 'pointer'}} to="/home">
				<img src={headerLogo} style={{width: 'inherit'}} alt="logo"/>
				</Link>
				<Navbar.Toggle aria-controls="basic-navbar-nav" bsPrefix="mobile-toggler navbar-toggler" />
				<Navbar.Collapse id="basic-navbar-nav">
						<ul className="nav navbar-nav">
							{user?.username && <li>Welcome {user?.username}</li>}
							<li role="separator" className="divider"></li>
							{user?.username ? <><li role="presentation" ><a href="home" role="menuitem" onClick={() => auth.resetPassword(user.email)}>Change Password</a></li>
							<li role="presentation" ><Link to="/profile">Change Username</Link></li>
							<li role="presentation" ><a href="/api/user/logout" target="_self">Logout</a></li></> :
							<li><a onClick={() => showLogin()} style={{display: 'inline'}}>Login</a> / <a onClick={() => showSignUp()} style={{display: 'inline'}}>Signup</a></li>
							}
							<li role="separator" className="divider"></li>
							<li><Link to="/new-location">Submit a New Location</Link></li>
							<li><Link to="/about">What is Climbcation?</Link></li>
							<li><a href="mailto:info@climbcation.com">Email Me!</a></li>
							<li><a href="https://www.instagram.com/climbcation/?ref=badge" className="contact-link"><img className="instagram-badge" src="//badges.instagram.com/static/images/ig-badge-24.png" alt="Instagram" /></a></li>
							<li><a href="https://www.facebook.com/climbcation"><div className="fb-like display-inline-block contact-link" data-href="https://www.facebook.com/climbcation" data-width="20" data-layout="button" data-action="like" data-size="small" data-show-faces="false" data-share="false"></div></a></li>
						</ul>

				</Navbar.Collapse>

			</div>





	    <div className="container d-none d-md-block" style={{width: '90%', margin: '0 auto', maxWidth: 'inherit'}}>
		    <Row>
		      <Col md={2} className="nav-link text">
		        <Link to="/new-location">Submit a New Location</Link>
		      </Col>
		      <Col md={2} className="nav-link text">
		        <Link to="/about">What is Climbcation?</Link>
		      </Col>
		      <Col md={4} className="nav-link">
		        <a className="navbar-logo" href="/home">
		          <img src={headerLogo} alt="logo" />
		        </a>
		      </Col>
		      <Col md={2} className="nav-link text">
				{
					user ? 
						<Dropdown>
							<Dropdown.Toggle id="dropdownMenu12" as="div" style={{cursor: 'pointer'}}>
								Welcome {user?.username}	
							</Dropdown.Toggle>
							<Dropdown.Menu>
								<Dropdown.Item onClick={() => auth.resetPassword(user.email)}>Change Password</Dropdown.Item>
								<Dropdown.Item><Link to="/profile">Change Username</Link></Dropdown.Item>
								<Dropdown.Item href="/api/user/logout" target="_self">Logout</Dropdown.Item>
							</Dropdown.Menu>	
						</Dropdown>
					:
						<div><div onClick={() => showLogin()} style={{cursor: 'pointer', display: 'inline-block'}} >Login</div> / <div style={{display: 'inline-block', cursor: 'pointer'}} onClick={() => showSignUp()}>Signup</div></div>
				}
		      </Col>
		      <Col md={2} className="nav-link text">
		        <a href="mailto:info@climbcation.com" style={{fontSize: '18px', verticalAlign: 'middle'}}><span className="glyphicon glyphicon-envelope"></span></a>
		        <a href="https://www.instagram.com/climbcation/?ref=badge" className="contact-link"><img className="instagram-badge" src="//badges.instagram.com/static/images/ig-badge-24.png" alt="Instagram" /></a>
		        <div className="fb-like display-inline-block contact-link" data-href="https://www.facebook.com/climbcation" data-width="20" data-layout="button" data-action="like" data-size="small" data-show-faces="false" data-share="false"></div>
		      </Col>
	      </Row>
		</div>
	  </Navbar>
				<LoginModal showLoginModal={openLogin} setShowLoginModal={setOpenLogin} signUpEnabled={openSignUp} setSignUpEnabled={setOpenSignUp} />
	</>
	);
}

export default Header;