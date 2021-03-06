// PROVIDED CODE BELOW (LINES 1 - 80) DO NOT REMOVE


// The store will hold all information needed globally
let store = {
	track_id: undefined,
	player_id: undefined,
	race_id: undefined,
}

// We need our javascript to wait until the DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
	onPageLoad()
	setupClickHandlers()
})

async function onPageLoad() {
	try {
		getTracks()
			.then(tracks => {
				const html = renderTrackCards(tracks)
				renderAt('#tracks', html)
			})

		getRacers()
			.then((racers) => {
				const html = renderRacerCars(racers)
				renderAt('#racers', html)
			})
	} catch (error) {
		console.log("Problem getting tracks and racers ::", error.message)
		console.error(error)
	}
}

function setupClickHandlers() {
	document.addEventListener('click', function (event) {
		const {
			target
		} = event

		// Race track form field
		if (target.matches('.card.track')) {
			handleSelectTrack(target)
		}

		// Podracer form field
		if (target.matches('.card.podracer')) {
			handleSelectPodRacer(target)
		}

		// Submit create race form
		if (target.matches('#submit-create-race')) {
			event.preventDefault()

			// start race
			handleCreateRace()
		}

		// Handle acceleration click
		if (target.matches('#gas-peddle')) {
			handleAccelerate(target)
		}

	}, false)
}

async function delay(ms) {
	try {
		return await new Promise(resolve => setTimeout(resolve, ms));
	} catch (error) {
		console.log("an error shouldn't be possible here")
		console.log(error)
	}
}
// ^ PROVIDED CODE ^ DO NOT REMOVE

// This async function controls the flow of the race, add the logic and error handling
async function handleCreateRace() {
	// render starting UI
	renderAt('#race', renderRaceStartView())

	// TODO - Get player_id and track_id from the store

	try {
		// distracturing store
		const {
			player_id,
			track_id
		} = store;
		const startGame = document.getElementById('submit-create-race');

		// asking user to choose track and player
		if (!player_id && !track_id) {
			alert("you have to choose player and Track");
			startGame.disabled = true;
		}

		// const race = TODO - invoke the API call to create the race, then save the result
		const race = await createRace(player_id, track_id);
		// update the store with the race id
		// For the API to work properly, the race id should be race id - 1
		store.race_id = race.ID - 1;

		renderAt('#race', renderRaceStartView(track_id));

		// The race has been created, now start the countdown

		await runCountdown();
		await startRace(store.race_id);
		await runRace(store.race_id);


	} catch (err) {
		console.log('look at the handleCreateRace and ather funcs relate to it ', err.message)
	}


}

function runRace(raceID) {
	return new Promise(resolve => {
		// setInterval method to get race info every 500ms
		const halfSec = setInterval(async () => {


			try {

				const response = await getRace(raceID);

				// response status controls when game is in progress and when game is finished
				if (response.status === "in-progress") {
					renderAt('#leaderBoard', raceProgress(response.positions))
				} else if (response.status === "finished") {
					clearInterval(halfSec);
					renderAt('#race', resultsView(response.positions));
					resolve(response);
				} else {
					clearInterval(halfSec);
					resolve(response);
				}



			} catch (err) {
				// remember to add error handling for the Promise
				console.log('look the problem in getRace func ', err.message);
			}

		}, 500);

	});

};

async function runCountdown() {
	try {
		// wait for the DOM to load
		await delay(1000)
		// time to start the game
		let startTime = 3

		return new Promise(resolve => {
			// setInterval method to count down once per second
			const fullSec = setInterval(() => {
				const gasPeddal = document.getElementById('gas-peddle');
				// run this DOM manipulation to decrement the countdown for the user
				const starter = document.getElementById('big-numbers');
				// activate the gas peddal when the starter time finishes
				if (startTime !== 0) {
					gasPeddal.disabled = true;
					starter.textContent = --startTime;

				} else {
					clearInterval(fullSec);
					resolve();
					gasPeddal.disabled = false;
				}


			}, 1000)


		})
	} catch (error) {
		console.log(error.message);
	}
}

function handleSelectPodRacer(target) {
	console.log("selected a pod", target.id)

	// remove class selected from all racer options
	const selected = document.querySelector('#racers .selected')
	if (selected) {
		selected.classList.remove('selected')
	}

	// add class selected to current target
	target.classList.add('selected')

	// save the selected racer to the store player ID
	store.player_id = parseInt(target.id);

}

function handleSelectTrack(target) {
	console.log("selected a track", target.id)

	// remove class selected from all track options
	const selected = document.querySelector('#tracks .selected')
	if (selected) {
		selected.classList.remove('selected')
	}

	// add class selected to current target
	target.classList.add('selected')

	// save the selected track id to the store track ID
	store.track_id = parseInt(target.id);

}

function handleAccelerate() {
	// console.log("accelerate button clicked")
	// Invoke the API call to accelerate

	// const { race_id } =store;
	console.log(store.race_id)
	accelerate(store.race_id)
		.catch(err => console.log(err.message))

}

// HTML VIEWS ------------------------------------------------
// Provided code - do not remove

function renderRacerCars(racers) {
	if (!racers.length) {
		return `
			<h4>Loading Racers...</4>
		`
	}

	const results = racers.map(renderRacerCard).join('')

	return `
		<ul id="racers">
			${results}
		</ul>
	`
}

function renderRacerCard(racer) {
	const {
		id,
		driver_name,
		top_speed,
		acceleration,
		handling
	} = racer

	return `
		<li class="card podracer" id="${id}">
			<h3>${driver_name}</h3>
			<p>${top_speed}</p>
			<p>${acceleration}</p>
			<p>${handling}</p>
		</li>
	`
}

function renderTrackCards(tracks) {
	if (!tracks.length) {
		return `
			<h4>Loading Tracks...</4>
		`
	}

	const results = tracks.map(renderTrackCard).join('')

	return `
		<ul id="tracks">
			${results}
		</ul>
	`
}

function renderTrackCard(track) {
	const {
		id,
		name
	} = track

	return `
		<li id="${id}" class="card track">
			<h3>${name}</h3>
		</li>
	`
}

function renderCountdown(count) {
	return `
		<h2>Race Starts In...</h2>
		<p id="big-numbers">${count}</p>
	`
}

function renderRaceStartView(track, racers) {
	return `
		<header>
			<h1>Race: ${track}</h1>
		</header>
		<main id="two-columns">
			<section id="leaderBoard">
				${renderCountdown(3)}
			</section>

			<section id="accelerate">
				<h2>Directions</h2>
				<p>Click the button as fast as you can to make your racer go faster!</p>
				<button id="gas-peddle">Click Me To Win!</button>
			</section>
		</main>
		<footer></footer>
	`
}

function resultsView(positions) {
	positions.sort((a, b) => (a.final_position > b.final_position) ? 1 : -1)

	return `
		<header>
			<h1>Race Results</h1>
		</header>
		<main>
			${raceProgress(positions)}
			<a href="/race">Start a new race</a>
		</main>
	`
}

function raceProgress(positions) {
	const userPlayer = positions.find(e => e.id === store.player_id)
	userPlayer.driver_name += " (you)"

	positions = positions.sort((a, b) => (a.segment > b.segment) ? -1 : 1)
	let count = 1

	const results = positions.map(p => {
		return `
			<tr>
				<td>
					<h3>${count++} - ${p.driver_name}</h3>
				</td>
			</tr>
		`
	})

	return `
		<main>
			<h3>Leaderboard</h3>
			<section id="leaderBoard">
				${results}
			</section>
		</main>
	`
}

function renderAt(element, html) {
	const node = document.querySelector(element)

	node.innerHTML = html
}

// ^ Provided code ^ do not remove


// API CALLS ------------------------------------------------

const SERVER = 'http://localhost:8000'

function defaultFetchOpts() {
	return {
		mode: 'cors',
		headers: {
			'Content-Type': 'application/json',
			'Access-Control-Allow-Origin': SERVER,
		},
	}
}

//  Making a fetch call (with error handling!) to each of the following API endpoints 

async function getTracks() {
	// GET request to `${SERVER}/api/tracks`
	try {
		const response = await fetch(`${SERVER}/api/tracks`)
		return await response.json()
	} catch (err) {
		return console.log('look the proplem in getTrackers func :', err.message)
	}
};
async function getRacers() {
	// GET request to `${SERVER}/api/cars`
	try {
		const response = await fetch(`${SERVER}/api/cars`)
		return await response.json()
	} catch (err) {
		return console.log('look at the getRacers func: ', err.message)
	}
}

async function createRace(player_id, track_id) {
	player_id = parseInt(player_id)
	track_id = parseInt(track_id)
	const body = {
		player_id,
		track_id
	}

	try {
		const res = await fetch(`${SERVER}/api/races`, {
			method: 'POST',
			...defaultFetchOpts(),
			dataType: 'jsonp',
			body: JSON.stringify(body),
			...defaultFetchOpts()
		})
		return await res.json()
	} catch (err) {
		return console.log("createRace has an error ", err.message)
	}
}

function getRace(id) {
	// GET request to `${SERVER}/api/races/${id}`
	return fetch(`${SERVER}/api/races/${id}`)
		.then(data => data.json())
		.catch(err => {
			console.log('look at getRace func: ', err.message)
		})

}

function startRace(id) {
	try {
		return fetch(`${SERVER}/api/races/${id}/start`, {
			method: 'POST',
			...defaultFetchOpts(),
		})

	} catch (err) {
		return console.log("in startRace has an error", err.message)
	}
}

function accelerate(id) {
	try {
		return fetch(`${SERVER}/api/races/${id}/accelerate`, {
			method: 'POST',
			...defaultFetchOpts()
		})
	} catch (error) {
		return console.log(error.message)
	}
}