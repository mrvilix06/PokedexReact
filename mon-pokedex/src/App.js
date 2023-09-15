import React, { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';
import {ReactSearchAutocomplete} from 'react-search-autocomplete';
import _ from 'lodash';

const types = {
  grass: '#78c850',
  ground: '#E2BF65',
  dragon: '#6F35FC',
  fire: '#F58271',
  electric: '#F7D02C',
  fairy: '#D685AD',
  poison: '#966DA3',
  bug: '#B3F594',
  water: '#6390F0',
  normal: '#D9D5D8',
  psychic: '#F95587',
  flying: '#A98FF3',
  fighting: '#C25956',
  rock: '#B6A136',
  ghost: '#735797',
  ice: '#96D9D6'
};

function App() {
  const [displayedPokemon, setDisplayedPokemon] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [index, setIndex] = useState(0);


useEffect(() => {
    fetchPokemonBase(25);
    setIsFirstLoad(false);
  }, []);



  const handleScroll = () => {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    if (clientHeight + scrollTop >= scrollHeight - 20 && !isLoading) {
      fetchPokemonBase(25);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isLoading]);

  const fetchPokemonBase = async (limit) => {
    setIsLoading(true);
    setError(null);
    try {
      if(index >= 151) return;
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon?offset=${index}&limit=${limit}`);
      const data = await response.json();
      const newPokemon = await Promise.all(data.results.map(fetchPokemonComplet));
      const filteredPokemon = _.filter(newPokemon, function(n) {
        return n.id <= 151;
      });

      const pokemonFr = await Promise.all(
        filteredPokemon.map(async (pokemon) => {
          const response = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemon.name}`);
          const pokeData = await response.json();
          pokemon.name = pokeData.names[4].name;
          return pokemon;
        })
      );
      setDisplayedPokemon(prev => [...prev, ...pokemonFr]);
      setIndex(prevIndex => prevIndex + 25);
    } catch (error) {
      setError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPokemonComplet = async (pokemon) => {
    const url = pokemon.url;
    const response = await fetch(url);
    const pokeData = await response.json();
    return {
      pic: pokeData.sprites.front_default,
      type: pokeData.types[0].type.name,
      id: pokeData.id,
      name: pokeData.name
    };
  };

  const fetchAllPokemon = async () => {
    if (index >= 151) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=151`);
      const data = await response.json();
      const allPokemon = await Promise.all(data.results.map(fetchPokemonComplet));
      const allPokemonFr = await Promise.all(
        allPokemon.map(async (pokemon) => {
          const response = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemon.name}`);
          const pokeData = await response.json();
          pokemon.name = pokeData.names[4].name;
          return pokemon;
        })
      );
      setDisplayedPokemon([...allPokemonFr]);
      setIndex(151);
    } catch (error) {
      setError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (string, results) => {
    if (index < 151) {
      fetchAllPokemon();
    }
  };

  const formatResult = (item) => {
    return (
      <>
      <div>
        <img src={item.pic} alt={item.name} />
        <span style={{ display: 'grid', textAlign: 'left' }}>{item.name}</span>
      </div>
      </>
    )
  }

  const handleOnSelect = (item) => {
    setSelectedPokemon(item);
  };



  return (
    <div className="App">
    <h1>Pokedex</h1>
    <div className='recherche-poke'>
        <ReactSearchAutocomplete
          items={displayedPokemon}
          onSearch={handleSearch}
          onFocus={() => {setSelectedPokemon(null)}}
          onSelect={handleOnSelect}
          formatResult={formatResult}
          onClear={() => {setSelectedPokemon(null)}}
        />
    </div>
    {!isFirstLoad && selectedPokemon ? (
  <div className="container">
    <ul className="liste-poke">
      <li style={{ background: types[selectedPokemon.type] }}>
        <img src={selectedPokemon.pic} alt={selectedPokemon.name} />
        <h5>{selectedPokemon.name}</h5>
        <p>ID# {selectedPokemon.id}</p>
      </li>
    </ul>
  </div>
) : (
  <div className="container">
    <ul className="liste-poke">
      {displayedPokemon.map((poke) => (
        <li key={poke.id} style={{ background: types[poke.type] }}>
          <img src={poke.pic} alt={poke.name} />
          <h5>{poke.name}</h5>
          <p>ID# {poke.id}</p>
        </li>
      ))}
    </ul>
  </div>
)}
    {isLoading && <div className="loader">
      <img src="pokeball.png" alt="pokeball" />
    </div>}
    {error && <p>Error: {error.message}</p>}
  </div>
  );
}

export default App;
