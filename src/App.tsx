import React from 'react';
import './App.scss';
import Header from './common/header';
import './importedcss/main.scss';
import {
  Switch,
  Route,
} from "react-router-dom";
import Home from './components/Home';
import About from './components/About';
import NewLocation from './components/NewLocation';
import LocationComponent from './components/Location';
import ResetPass from './components/ResetPass';
import Profile from './components/Profile';
import {Login} from './components/Login';
import {ProvideAuth} from './common/useAuth';


function App() {

	return (
		<div className="App">
			<ProvideAuth>
				<Header />
				<Switch>
					<Route path='/' component={Home} exact/>
					<Route path='/home' component={Home} />
					<Route path='/about' component={About} />
					<Route path='/new-location' component={NewLocation} />
					<Route path='/location/:slug' component={LocationComponent} />
					<Route path='/resetpass' component={ResetPass} />
					<Route path='/profile' component={Profile} />
					<Route path='/login' component={Login} />
					<Route path='/signup' component={Login} />
					<Route component={Error} />
				</Switch>
			</ProvideAuth>
		</div>
		);
	}

	export default App;
