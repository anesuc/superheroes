import React, { Component } from 'react';


import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import ListGroup from 'react-bootstrap/ListGroup';
import Glyphicon from '@strongdm/glyphicon';
import Autosuggest from 'react-autosuggest';
import AutosuggestHighlightMatch from 'autosuggest-highlight/match';
import AutosuggestHighlightParse from 'autosuggest-highlight/parse';


import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import heroes_image from './img/heroes.png';

//const test = './img/'+getRandomInt(1,3)+'.jpg';

//const background_image = import(test);

import background_image_a from './img/1.jpg';
import background_image_b from './img/2.jpg';
import background_image_c from './img/3.jpg';

/**
 * Returns a random integer between min (inclusive) and max (inclusive).
 */
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


/* Chose a background to use*/
const background_images = [background_image_a,background_image_b,background_image_c];

const background_image = background_images[getRandomInt(0,2)];

var superheroesData = [];
var selectedSuperHero;
var selectedSuperHeroOld;
var savedHeroes = [];



// https://developer.mozilla.org/en/docs/Web/JavaScript/Guide/Regular_Expressions#Using_Special_Characters
function escapeRegexCharacters(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Makea a GET request and expects a JSON response
 *
 * @param {String} URL to make the request to
 * @return object.
 */
const getRequest = async (url) => {
    const response = await fetch(url);
    const body = await response.json();
    if (response.status !== 200) throw Error(body.message);
    return body;
  };


/**
 * Matches the saved stats with the superhero object that has the rest of the information about the given superhero
 *
 * @param {Array} An array of superheros that have been saved before.
 * @return null.
 */

  const processLocalStats = async (heroesResults) => {
    for (var i = 0; i < heroesResults.length; i++) {
          const response = await fetch("https://www.superheroapi.com/api.php/2947090878909739/"+heroesResults[i].id);
          const heroResult = await response.json();
          heroResult.powerstats.combat = heroesResults[i].combat;
          heroResult.powerstats.durability = heroesResults[i].durability;
          heroResult.powerstats.intelligence = heroesResults[i].intelligence;
          heroResult.powerstats.power = heroesResults[i].power;
          heroResult.powerstats.speed = heroesResults[i].speed;
          heroResult.powerstats.strength = heroesResults[i].strength;
           savedHeroes.push(heroResult);
        }
         
         var element = document.getElementsByClassName('react-autosuggest__input')[0];
        element.focus();
        element.blur();
        element.focus();
  };

//Getting saved user stats
  getRequest("/api/updated_stats_all")
      .then(heroesResults => {
        //savedHeroes = heroesResults;
       
        processLocalStats(heroesResults);

      })
      .catch(err => console.log(err));



function getSuggestions(value) {
  const escapedValue = escapeRegexCharacters(value.trim());
  var returnResult = superheroesData;
  
  if (escapedValue === '') {
    return [];
  }

  if (value.length > 2 && superheroesData !== undefined) {
    if (superheroesData.length !== 0) { //Prevent asking the server too much. We most likely have our result
    console.log("filtering..");
      const regex = new RegExp('\\b' + escapedValue, 'i');
      returnResult = superheroesData.filter(superhero => regex.test(getSuggestionValue(superhero))); //FXIME handle spaces in dashes

      if (returnResult.length === 0)
        superheroesData = []; //reset let's ask the servers again
    } else {
      getRequest("https://www.superheroapi.com/api.php/2947090878909739/search/"+value)
      .then(searchResults => {
        if (searchResults.results !== null) 
          superheroesData = searchResults.results;
        else
          superheroesData = [];
        
        //Force re-render of list
        var element = document.getElementsByClassName('react-autosuggest__input')[0];
        element.blur();
        element.focus();
      })
      .catch(err => console.log(err));
    returnResult = superheroesData;
    }
    
  }
  return returnResult;
}

/**
 * Returns the name of the superhero of interest
 *
 * @param {Object} A superhero suggestion object.
 * @return String.
 */
function getSuggestionValue(suggestion) {
  return `${suggestion.name}`;
}

/**
 * Renders the suggestion from the autocomplete.
 *
 * @param {Object} The suggestion object.
 * @param {String} The search query.
 * @return null.
 */
function renderSuggestion(suggestion, { query }) {
  const suggestionText = `${suggestion.name}`;
  const matches = AutosuggestHighlightMatch(suggestionText, query);
  const parts = AutosuggestHighlightParse(suggestionText, matches);
console.log("suggestion.name ",suggestion.name);
  return (
    <span className={'suggestion-content ' + suggestion.name}>
    <img src={suggestion.image.url} className="hero-img-sm"  alt="Logo" />;
      <span className="name">
        {
          parts.map((part, index) => {
            const className = part.highlight ? 'highlight' : null;

            return (
              <span className={className} key={index}>{part.text}</span>
            );
          })
        }
        <br/>
        <small>{suggestion.work.occupation}</small>
      </span>
    </span>
  );
}

class App extends Component {
  constructor() {
    super();

    this.state = {
      value: '',
      suggestions: [],
      currentPage: 'home',
      background: background_image
    };    
  }

  onChange = (event, { newValue, method }) => {
    this.setState({
      value: newValue
    });
  };

  onStatisticChange = (event, { newValue, method }) => {
    /*this.setState({
      value: newValue
    });*/
  };
  
  onSuggestionsFetchRequested = ({ value }) => {
    this.setState({
      suggestions: getSuggestions(value)
    });
  };

  onSuggestionsClearRequested = () => {
    this.setState({
      suggestions: []
    });
  };


  onSuggestionSelected = (event, suggestionData) => {
    var superheroExists = savedHeroes.filter(function (el) {
            return el.id === suggestionData.suggestion.id;
    });

    if (superheroExists.length === 1) {
      suggestionData = superheroExists[0];
      selectedSuperHero = suggestionData;
    } else {
      selectedSuperHero = suggestionData.suggestion;
    }
  console.log("selected suggestion: ",suggestionData);
  this.setState({
      currentPage: "profile-explore",
      background: selectedSuperHero.image.url
    });
}

onHeroSelected = (heroLoation) => {
  const suggestionData = savedHeroes[heroLoation];
  
  console.log("selected suggestion: ",suggestionData);
  selectedSuperHero = suggestionData;
  this.setState({
      currentPage: "profile-explore",
      background: selectedSuperHero.image.url
    });
    
}

editPowerStats = () => {
  selectedSuperHeroOld = JSON.parse(JSON.stringify(selectedSuperHero)); //Clone object
    this.setState({
      currentPage: "edit-stats"
    });
  };

goToProfileExplore = async (canceled) => {
  console.log("savedHeroes: ",savedHeroes);
  if (canceled)
    selectedSuperHero = JSON.parse(JSON.stringify(selectedSuperHeroOld)); //Clone object
  else {

      const response = await fetch('/api/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(selectedSuperHero),
    });
    const body = await response.text();

    console.log("returned body",body);

    const result = JSON.parse(body);

    if (!result.error) {
      var superheroExists = savedHeroes.filter(function (el) {
            return el.id === selectedSuperHero.id;
    });

    if (superheroExists.length === 1) {
      superheroExists[0] = selectedSuperHero;
    } else {
      savedHeroes.push(selectedSuperHero);
    }
    }
    
    
  
  }

  
  
  selectedSuperHeroOld = null; //Free memory

    this.setState({
      currentPage: "profile-explore"
    });
  };


	render() {
    const { value, suggestions, currentPage, background } = this.state;
    const inputProps = {
      placeholder: "Search for a super hero...",
      value,
      onChange: this.onChange
    };

    var savedHeroesDivs = [];
for (var i = savedHeroes.length-1; i > -1; i--) {
    savedHeroesDivs.push(
      <ListGroup.Item>
      
      <a href="#" hero={i} onClick={e => this.onHeroSelected(e.target.attributes.hero.value)}>
    <img src={savedHeroes[i].image.url} hero={i}  alt={savedHeroes[i].name} />
    <div hero-location={i}>{savedHeroes[i].name}</div>
    </a>
    </ListGroup.Item>);
}
		return (
      <div>
      <div className="hero-bg">
      <img src={background}  alt="background image" />
      </div>

      <Row className="justify-content-md-center">
      <Col md={12} className="text-center">
      {currentPage === 'home' ? 
      <img src={heroes_image} className="App-logo" alt="logo" />
      : null}
			<Form>
				<Form.Group controlId="formBasicEmail">
					
          <Autosuggest 
        suggestions={suggestions}
        onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
        onSuggestionsClearRequested={this.onSuggestionsClearRequested}
        getSuggestionValue={getSuggestionValue}
        onSuggestionSelected={this.onSuggestionSelected}
        renderSuggestion={renderSuggestion}
        inputProps={inputProps}
        highlightFirstSuggestion={true} />
        </Form.Group>
        {currentPage === 'home' ? 
        <div>
				<Button variant="primary" type="submit">
					Search
  				</Button>

          
          </div>
          
          : null}
			</Form>
      </Col>
      {currentPage !== 'home' ? 
      <div className="row hero-view">
       <Col md={6} className="text-right">
       <img src={selectedSuperHero.image.url} className="hero-image" alt="Hero Image" />
       </Col>
       <Col md={6}>
       <h2>
       {selectedSuperHero.name}
       </h2>
       <p>
       {selectedSuperHero.work.occupation}
       </p>
       <hr/>
       <h4> Biography </h4>
       {selectedSuperHero.biography["full-name"] !== '-' ? 
       <p> <b>Full Name:</b> {selectedSuperHero.biography["full-name"]} </p>
       : null}
       {selectedSuperHero.biography['place-of-birth'] !== '-' ? 
       <p> <b>Place of birth:</b> {selectedSuperHero.biography['place-of-birth']} </p>
       : null}
       {selectedSuperHero.biography.publisher !== '-' ? 
       <p> <b>Publisher:</b> {selectedSuperHero.biography.publisher} </p>
       : null}
       <hr/>

       {currentPage === 'edit-stats' ? 
       <div>
       <h4> Power Stats <Button variant="danger" className="btn-sm" onClick={e => this.goToProfileExplore(true)}> Cancel </Button> <Button variant="primary" className="btn-sm" onClick={e => this.goToProfileExplore(false)}> <Glyphicon glyph="ok" /> Save </Button></h4>
       {selectedSuperHero.powerstats.combat !=="null" && selectedSuperHero.powerstats.combat !==-1 ? 
       <p> <Glyphicon glyph="stats" /> <span> Combat: <input
            type="number"
            defaultValue={selectedSuperHero.powerstats.combat}
            min="0"
            max="100"
            onChange={e => selectedSuperHero.powerstats.combat = e.target.value}
          /></span> </p>
          : null}
          {selectedSuperHero.powerstats.durability !=="null" && selectedSuperHero.powerstats.durability !==-1 ? 
       <p> <Glyphicon glyph="stats" /> <span> Durability: <input
            type="number"
            defaultValue={selectedSuperHero.powerstats.durability}
            min="0"
            max="100"
            onChange={e => selectedSuperHero.powerstats.durability = e.target.value}
          /> </span> </p>
          : null}
          {selectedSuperHero.powerstats.intelligence !=="null" && selectedSuperHero.powerstats.intelligence !==-1 ? 
       <p> <Glyphicon glyph="bishop" /> <span> Intelligence: <input
            type="number"
            defaultValue={selectedSuperHero.powerstats.intelligence}
            min="0"
            max="100"
            onChange={e => selectedSuperHero.powerstats.intelligence = e.target.value}
          /> </span> </p>
          : null}
          {selectedSuperHero.powerstats.power !=="null" && selectedSuperHero.powerstats.power !==-1 ?
       <p> <Glyphicon glyph="flash" /> <span> Power: <input
            type="number"
            defaultValue={selectedSuperHero.powerstats.power}
            min="0"
            max="100"
            onChange={e => selectedSuperHero.powerstats.power = e.target.value}
          /> </span> </p>
          : null}
          {selectedSuperHero.powerstats.speed !=="null" && selectedSuperHero.powerstats.speed !==-1 ?  
       <p> <Glyphicon glyph="dashboard" /> <span> Speed: <input
            type="number"
            defaultValue={selectedSuperHero.powerstats.speed}
            min="0"
            max="100"
            onChange={e => selectedSuperHero.powerstats.speed = e.target.value}
          /> </span> </p>
          : null}
          {selectedSuperHero.powerstats.strength !=="null" && selectedSuperHero.powerstats.strength !==-1? 
       <p> <Glyphicon glyph="stats" /> <span> Strength: <input
            type="number"
            defaultValue={selectedSuperHero.powerstats.strength}
            min="0"
            max="100"
            onChange={e => selectedSuperHero.powerstats.strength = e.target.value}
          /> </span> </p>
          : null}
       </div>
       : <div>
       <h4> Power Stats <Button variant="primary" className="btn-sm" onClick={e => this.editPowerStats()}> <Glyphicon glyph="pencil" /> Edit </Button></h4>
       {selectedSuperHero.powerstats.combat !=="null" && selectedSuperHero.powerstats.combat !==-1 ? 
       <p> <Glyphicon glyph="stats" /> <span className="superhero-label"> Combat:</span><span> {selectedSuperHero.powerstats.combat} </span> </p>
       : null}
       {selectedSuperHero.powerstats.durability !=="null" && selectedSuperHero.powerstats.durability !==-1 ? 
       <p> <Glyphicon glyph="stats" /> <span className="superhero-label"> Durability:</span><span> {selectedSuperHero.powerstats.durability} </span> </p>
       : null}
       {selectedSuperHero.powerstats.intelligence !=="null" && selectedSuperHero.powerstats.intelligence !==-1 ? 
       <p> <Glyphicon glyph="bishop" /> <span className="superhero-label"> Intelligence:</span><span> {selectedSuperHero.powerstats.intelligence} </span> </p>
       : null}
       {selectedSuperHero.powerstats.power !=="null" && selectedSuperHero.powerstats.power !==-1 ? 
       <p> <Glyphicon glyph="flash" /> <span className="superhero-label"> Power:</span><span> {selectedSuperHero.powerstats.power} </span> </p>
       : null}
       {selectedSuperHero.powerstats.speed !=="null" && selectedSuperHero.powerstats.speed !==-1 ? 
       <p> <Glyphicon glyph="dashboard" /> <span className="superhero-label"> Speed:</span><span> {selectedSuperHero.powerstats.speed} </span> </p>
       : null}
       {selectedSuperHero.powerstats.strength !=="null" && selectedSuperHero.powerstats.strength !==-1 ? 
       <p> <Glyphicon glyph="stats" /> <span className="superhero-label"> Strength:</span><span> {selectedSuperHero.powerstats.strength} </span> </p>
       : null}
       </div>}
       </Col>
       </div>
      : null}
      {savedHeroesDivs.length !==0 ? 
       <Row className="user-edited-list">
      <h5> Saved </h5>
      
      <div>
      <ListGroup horizontal>
      {savedHeroesDivs}
      </ListGroup>
      </div>
      </Row>
      : null}
      </Row>
      
      </div>
		)
	}
}

//I don't have a paid version of Glyphicon to have the more accurate icon set

export default () => (<div><App /></div>)