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
import Location from './components/Location';
import ResetPass from './components/ResetPass';
import Profile from './components/Profile';
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
					<Route path='/location/:slug' component={Location} />
					<Route path='/resetpass' component={ResetPass} />
					<Route path='/profile' component={Profile} />

						{/* TODO: need a solution for GOTO routes: 
						.when('/', {
								redirectTo: function(current, path, search) {
									if (search.goto) {
										// if we were passed in a search param, and it has a path
										// to redirect to, then redirect to that path
										return "/" + search.goto
									} else {
										// else just redirect back to this location
										// angular is smart enough to only do this once.
										return "/home"
									}
								}
								})
							*/
							}
					<Route component={Error} />
				</Switch>
			</ProvideAuth>
		</div>
		);
	}

	export default App;
