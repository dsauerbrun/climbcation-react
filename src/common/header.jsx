import React from 'react';
import Nav from 'react-bootstrap/Nav';
import Col from 'react-bootstrap/Col';
import {Row} from 'react-bootstrap';
import './header.scss';
import headerLogo from '../images/climbcation-header-logo.png';
import {
  BrowserRouter,
  Switch,
  Route,
  Link
} from "react-router-dom";


function Header() {
	return (
		<Nav className="navbar home navbar-inverse">
	    <div className="d-sm-none">
	      <div className="navbar-header">
	        <button type="button" className="navbar-toggle" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1">
	          <span className="icon-bar"></span>
	          <span className="icon-bar"></span>
	          <span className="icon-bar"></span>
	        </button>
	        <a className="navbar-brand" style={{width: '80%', padding: '5px 15px', cursor: 'pointer'}} href="home">
	          <img src={headerLogo} style={{width: 'inherit'}} alt="logo"/>
	        </a>
	      </div>

	      <div className="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
	        <ul className="nav navbar-nav">
	          <li><a>Welcome username</a></li>
	          <li role="separator" className="divider"></li>
	          <li role="presentation" ><a role="menuitem" onClick={console.log('reset')/*resetPassword('email@email.com')*/}>Change Password</a></li>
	          <li role="presentation" ><a role="menuitem" tabIndex="-1" href="/profile">Change Username</a></li>
	          <li role="presentation" ><a role="menuitem" tabIndex="-1" href="/api/user/logout" target="_self">Logout</a></li>
	          <li role="separator" className="divider"></li>
	          <li><a href="new-location">Submit a New Location</a></li>
	          <li><Link to="/about">What is Climbcation?</Link></li>
	          <li><a href="mailto:info@climbcation.com">Email Me!</a></li>
	          <li><a href="https://www.instagram.com/climbcation/?ref=badge" className="contact-link"><img className="instagram-badge" src="//badges.instagram.com/static/images/ig-badge-24.png" alt="Instagram" /></a></li>
	          <li><a><div className="fb-like display-inline-block contact-link" data-href="https://www.facebook.com/climbcation" data-width="20" data-layout="button" data-action="like" data-size="small" data-show-faces="false" data-share="false"></div></a></li>
	          
	        </ul>
	        
	      </div>
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
		        <a className="navbar-logo" href="home">
		          <img src={headerLogo} alt="logo" />
		        </a>
		      </Col>
		      <Col md={2} className="nav-link text">
		        <div className="dropdown">
		          <div className="dropdown-toggle" type="button" id="dropdownMenu12" data-toggle="dropdown" style={{cursor: 'pointer'}}>
		            Welcome Daniel Sauerbrun
		            <span className="caret"></span>
		          </div>
		          <ul className="dropdown-menu" role="menu" aria-labelledby="dropdownMenu12" style={{left: '60%'}}>
		            <li role="presentation"><a role="menuitem" style={{color: 'inherit'}} onClick={console.log('reset')/*resetPassword('email@email.com')*/}>Change Password</a></li>
		            <li role="presentation"><a role="menuitem" tabIndex="-1" style={{color: 'inherit'}} href="/profile">Change Username</a></li>
		            <li role="presentation"><a role="menuitem" tabIndex="-1" style={{color: 'inherit'}} href="/api/user/logout" target="_self">Logout</a></li>
		          </ul>
		        </div>
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