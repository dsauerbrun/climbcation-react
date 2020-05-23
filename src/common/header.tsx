import React, { useContext } from 'react';
import Nav from 'react-bootstrap/Nav';
import Col from 'react-bootstrap/Col';
import {Row, Dropdown} from 'react-bootstrap';
import {authContext, User} from './useAuth';
import './header.scss';
import headerLogo from '../images/climbcation-header-logo.png';
import {
  Link
} from "react-router-dom";


function Header() {
	const auth = useContext(authContext);
	let user: User = auth.user;

	let showSignUp = () => {

	}

	let showLogin = () => {

	}

	return (
		<Nav className="navbar home navbar-inverse">
	    <div className="d-sm-none">
	      <div className="navbar-header">
	        <button type="button" className="navbar-toggle" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1">
	          <span className="icon-bar"></span>
	          <span className="icon-bar"></span>
	          <span className="icon-bar"></span>
	        </button>
	        <Link className="navbar-brand" style={{width: '80%', padding: '5px 15px', cursor: 'pointer'}} to="/home">
	          <img src={headerLogo} style={{width: 'inherit'}} alt="logo"/>
	        </Link>
	      </div>

	      <div className="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
	        <ul className="nav navbar-nav">
	          <li><a href="/home">Welcome username</a></li>
	          <li role="separator" className="divider"></li>
	          <li role="presentation" ><a href="home" role="menuitem" onClick={() => console.log('reset')/*resetPassword('email@email.com')*/}>Change Password</a></li>
	          <li role="presentation" ><a role="menuitem" tabIndex={-1} href="/profile">Change Username</a></li>
	          <li role="presentation" ><a role="menuitem" tabIndex={-1} href="/api/user/logout" target="_self">Logout</a></li>
	          <li role="separator" className="divider"></li>
	          <li><a href="new-location">Submit a New Location</a></li>
	          <li><Link to="/about">What is Climbcation?</Link></li>
	          <li><a href="mailto:info@climbcation.com">Email Me!</a></li>
	          <li><a href="https://www.instagram.com/climbcation/?ref=badge" className="contact-link"><img className="instagram-badge" src="//badges.instagram.com/static/images/ig-badge-24.png" alt="Instagram" /></a></li>
	          <li><a href="https://www.facebook.com/climbcation"><div className="fb-like display-inline-block contact-link" data-href="https://www.facebook.com/climbcation" data-width="20" data-layout="button" data-action="like" data-size="small" data-show-faces="false" data-share="false"></div></a></li>
	        </ul>
	      </div>
	    </div>
		{/*
		
			MOBILE VERSION ABOVE
		
		
		*/}
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
						<div><Link to="/login">Login</Link> / <Link to="/signup">Signup</Link></div>
				}
		      </Col>
		      <Col md={2} className="nav-link text">
		        <a href="mailto:info@climbcation.com" style={{fontSize: '18px', verticalAlign: 'middle'}}><span className="glyphicon glyphicon-envelope"></span></a>
		        {/*instagram badge script*/}
		        <a href="https://www.instagram.com/climbcation/?ref=badge" className="contact-link"><img className="instagram-badge" src="//badges.instagram.com/static/images/ig-badge-24.png" alt="Instagram" /></a>
		        <div className="fb-like display-inline-block contact-link" data-href="https://www.facebook.com/climbcation" data-width="20" data-layout="button" data-action="like" data-size="small" data-show-faces="false" data-share="false"></div>
		      </Col>
	      </Row>
	    </div>
	  </Nav>
	);
}

export default Header;