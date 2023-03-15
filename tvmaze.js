"use strict";
const $episodesList = $('#episodes-list');
const $showsList = $("#shows-list");
const $episodesArea = $("#episodes-area");
const $searchForm = $("#search-form");
const $term = $("#search-query").val();
const missingImage = "https://tinyurl.com/missing-tv";
const tvMazeApiUrl = "https://api.tvmaze.com/search";

/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */
//This will be my search function and API request. I will need to capture the input,
// insert it as a parameter in my request and return the parsed data saved to a variable.
//This was actually a simpler function than I initially thought it would be as the 
//event listener is already handled down below.
async function getShowsByTerm($term) {
    const response = await axios({
      url: `${tvMazeApiUrl}/shows?q=${$term}`,
       method : "Get"
    });
    return response.data.map(result => {
      const show = result.show;
      return {
        id: show.id,
        name: show.name,
        summary: show.summary,
        image: show.image ? show.image.medium : missingImage,
      };    }); 
  }
    

/** Given list of shows, create markup for each and to DOM */ 
function populateShows(shows) {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
        `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img 
              src="${show.image}" 
              alt="${show.name}" 
              class="w-25 mr-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>  
       </div>
      `);

    $showsList.append($show);  }
}


// /** Handle search form submission: get shows from API and display.
//  *    Hide episodes area (that only gets shown if they ask for episodes)
//  */

async function searchForShowAndDisplay() {
  const term = $("#search-query").val();
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});


// /** Given a show ID, get from API and return (promise) array of episodes:
//  *      { id, name, season, number }
//  */

async function getEpisodesOfShow(id) {
  const response = await axios({
    url: `${tvMazeApiUrl}/shows/${id}/episodes`,
     method : "Get"
  });
  return response.data.map(e => ({
      id: e.id,
      name: e.name,
      season: e.season,
      number: e.number,
    
  }));
 }

//These two functions are basically copies of the above functions except they are specifically designated
// for episode searches. 

function populateEpisodes(episodes) { 
  $episodesList.empty();
  for (let episode of episodes) {
    const $episode = $(
      `<li>
      ${episode.name}
      (season ${episode.season}, episode ${episode.number})
    </li>
    `);
  $episodesList.append($episode);
}
$episodesArea.show();
}
// This will be the event handler for the episode search function and it will link the 
// search and populate functions together. 
async function getAndDisplayEpisodes(evt){
  //I did have to use the solution code for this function. I couldn't for the life of 
  //me figure out how to get the show id to populate on the click.
  const showId = $(evt.target).closest(".Show").data("show-id");
  const episodes = await getEpisodesOfShow(showId);
  populateEpisodes(episodes);
}

$showsList.click(".Show-getEpisodes", getAndDisplayEpisodes);