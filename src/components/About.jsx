import React from 'react';

function About () {
	return (
		<div className="container">
      <h3 style={{marginTop: '10px'}}>Hi there, my name is Daniel Sauerbrun and I wrote Climbcation!</h3>
      <br />
      <h4><strong>So what is Climbcation you ask?</strong></h4>
      <p>
        Climbcation is a fun little idea I came up with when I was on a climbing vacation in Europe(hence Climbcation...).
        I was on a round the world trip and was a budding gym climber who brought his shoes and harness along. Mid-way through the trip I realized I just want to go climbing all the time and ended up buying a rope and draws. At this point I was in Europe, but as a new climber, I didn't know where all the good crags were, if they were in season, if I was strong enough to climb there, etc...
        There were decent resources out there like mountain project and climb-europe.com but neither of those were good at filtering down to the places worth making a trip to; you'd have to do a ton of manual research. So that's when I thought of Climbcation; what if I could just put in a couple basic parameters, like where in the world I am, what time of year is it, what type of climbing I want to do, and how hard I climb which would retrieve a bunch of results for places I should go climbing at.
      </p>

      <p>
        Climbcation is just that. If you have an idea of what you want to do on a climbing trip, this site will give you your options to pick from.
      </p>

      <h4><strong>Why?</strong></h4>
      <p>
        Climbing has changed my life. I have fully immersed myself in this awesome sport and community. I have met so many cool people and climbed on so many routes that others have developed, it was important for me to give back. This project is a way for me to help out the community so I hope you find it useful.
      </p>

      <p>
        For this project I had to lean on the climbing community for some help. I want to thank all of the gyms below for letting me pester their clientele to add new destinations to Climbcation!
      </p>

      <ul>
        <li><a href="http://boulderrockclub.com/" target="_blank">Boulder Rock Club - Boulder</a></li>
        <li><a href="http://www.climbcityrock.com/" target="_blank">City Rock Climbing Center - Colorado Springs</a></li>
        <li><a href="https://www.earthtreksclimbing.com/co/" target="_blank">Earth Treks - Golden</a></li>
        <li><a href="http://innerstrengthrock.com/" target="_blank">Inner Strength Rock Gym - Fort Collins</a></li>
        <li><a href="http://movementboulder.com/" target="_blank">Movement Climbing and Fitness - Boulder</a></li>
        <li><a href="http://movementdenver.com/" target="_blank">Movement Climbing and Fitness - Denver</a></li>
        <li><a href="http://www.sportclimbingcenter.com/" target="_blank">Sport Climbing Center - Colorado Springs</a></li>
      </ul>

      <p>
        I also want to give a thank you to Bryan Zavestoski for lending a hand on the UI. If you like the look and feel of Climbcation and you're looking for a UI/UX guy, you can find his information at <a href="http://zavzen.com/" target="_blank">www.zavzen.com</a>
      </p>
    </div>
	);
}

export default About;