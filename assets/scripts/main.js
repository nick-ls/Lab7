// main.js

// CONSTANTS
const RECIPE_URLS = [
	'https://introweb.tech/assets/json/1_50-thanksgiving-side-dishes.json',
	'https://introweb.tech/assets/json/2_roasting-turkey-breast-with-stuffing.json',
	'https://introweb.tech/assets/json/3_moms-cornbread-stuffing.json',
	'https://introweb.tech/assets/json/4_50-indulgent-thanksgiving-side-dishes-for-any-holiday-gathering.json',
	'https://introweb.tech/assets/json/5_healthy-thanksgiving-recipe-crockpot-turkey-breast.json',
	'https://introweb.tech/assets/json/6_one-pot-thanksgiving-dinner.json',
];

// Run the init() function when the page has loaded
window.addEventListener('DOMContentLoaded', init);

// Starts the program, all function calls trace back here
async function init() {
	// initialize ServiceWorker
	initializeServiceWorker();
	// Get the recipes from localStorage
	let recipes;
	try {
		recipes = await getRecipes();
	} catch (err) {
		console.error(err);
	}
	// Add each recipe to the <main> element
	addRecipesToDocument(recipes);
}

/**
 * Detects if there's a service worker, then loads it and begins the process
 * of installing it and getting it running
 */
function initializeServiceWorker() {
	// EXPLORE - START (All explore numbers start with B)
	/*******************/
	// ServiceWorkers have many uses, the most common of which is to manage
	// local caches, intercept network requests, and conditionally serve from
	// those local caches. This increases performance since users aren't
	// re-downloading the same resources every single page visit. This also allows
	// websites to have some (if not all) functionality offline! I highly
	// recommend reading up on ServiceWorkers on MDN before continuing.
	/*******************/
	// We first must register our ServiceWorker here before any of the code in
	// sw.js is executed.
	if (!("serviceWorker" in navigator)) return;
	addEventListener("load", e => {
		navigator.serviceWorker.register("./sw.js").then(registration => {
			if (registration.installing) {
				console.log("Service worker installing");
			} else if (registration.waiting) {
				console.log("Service worker installed");
			} else if (registration.active) {
				console.log("Service worker active");
			}
		}).catch(e => {
			console.error(`Service worker registration failed: ${e}`);
		});
	});
}

/**
 * Reads 'recipes' from localStorage and returns an array of
 * all of the recipes found (parsed, not in string form). If
 * nothing is found in localStorage, network requests are made to all
 * of the URLs in RECIPE_URLs, an array is made from those recipes, that
 * array is saved to localStorage, and then the array is returned.
 * @returns {Array<Object>} An array of recipes found in localStorage
 */
async function getRecipes() {
	/**
	 * First load recipes from localStorage if they exist
	 */
	let recipes = localStorage.getItem("recipes");
	if (recipes) {
		try {
			return JSON.parse(recipes);
		} catch(e) {
			return [];
		}
	}

	/**************************/
	// The rest of this method will be concerned with requesting the recipes
	// from the network


	/**
	 * This would be a smarter way of doing it, since manually creating promises
	 * inside of an async function is really not necessary. Additionally, with
	 * this method of doing it, you are guaranteed to have the network requests
	 * finish in the order they are in the initial array.
	 *
	recipes = [];
	for (let url of RECIPE_URLS) {
		// Unless you want to throw custom errors or do custom handling of errors,
		// it's best to just forego the try/catch and just let the error happen
		// without re-throwing it. To make this solution conform more to the steps,
		// the try/catch was included
		try {
			let data = await fetch(url);
			recipes.push(await data.json());
		} catch (e) {
			console.error(e);
			throw e;
		}
	}
	saveRecipesToStorage(recipes);
	return recipes;
	//*/


	/**
	 * For posterity, this version was also implemented using the steps for the 
	 * expose section. It is not run in the file, but it can be by commenting out
	 * the above code. It functions exactly the same as the code above, but it 
	 * implements the steps in part A using a manually created promise.
	 */
	recipes = [];
	return new Promise((resolve, reject) => {
		let finished = 0;
		let err = e => {
			console.error(e);
			reject(e);
		};
		for (let url of RECIPE_URLS) {
			fetch(url).then(body => {
				body.json().then(json => {
					recipes.push(json);
					finished++;
					if (finished >= RECIPE_URLS.length) {
						saveRecipesToStorage(recipes);
						resolve(recipes);
					}
				}).catch(err);
			}).catch(err);
		}
	});
}

/**
 * Takes in an array of recipes, converts it to a string, and then
 * saves that string to 'recipes' in localStorage
 * @param {Array<Object>} recipes An array of recipes
 */
function saveRecipesToStorage(recipes) {
	localStorage.setItem('recipes', JSON.stringify(recipes));
}

/**
 * Takes in an array of recipes and for each recipe creates a
 * new <recipe-card> element, adds the recipe data to that card
 * using element.data = {...}, and then appends that new recipe
 * to <main>
 * @param {Array<Object>} recipes An array of recipes
 */
function addRecipesToDocument(recipes) {
	if (!recipes) return;
	let main = document.querySelector('main');
	recipes.forEach((recipe) => {
		let recipeCard = document.createElement('recipe-card');
		recipeCard.data = recipe;
		main.append(recipeCard);
	});
}
