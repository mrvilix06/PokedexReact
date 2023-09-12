import React, { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';

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
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [index, setIndex] = useState(0);


useEffect(() => {
    fetchPokemonBase();
  }, []);

  const handleScroll = () => {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    if (clientHeight + scrollTop >= scrollHeight - 20 && !isLoading) {
      fetchPokemonBase();
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isLoading]);

  const fetchPokemonBase = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if(index > 151) return;
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon?offset=${index}&limit=20`);
      const data = await response.json();
      const newPokemon = await Promise.all(data.results.map(fetchPokemonComplet));
      setDisplayedPokemon(prev => [...prev, ...newPokemon]);
      setIndex(prevIndex => prevIndex + 20);
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

  const handleSearch = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  return (
    <div className="App">
    <h1>Pokedex</h1>
    <form className="recherche-poke">
      <label htmlFor="recherche">Rechercher un pokémon</label>
      <input type="text" id="recherche" value={searchTerm} onChange={handleSearch} />
    </form>
    <div className="container">
      <ul className="liste-poke">
        {displayedPokemon.map((poke, index) => (
          <li key={poke.id} style={{ background: types[poke.type] }}>
            <img src={poke.pic} alt={poke.name} />
            <h5>{poke.name}</h5>
            <p>ID# {poke.id}</p>
          </li>
        ))}
      </ul>
    </div>
    {isLoading && <div className="loader">
      <img src="pokeball.png" alt="pokeball" />
    </div>}
    {error && <p>Error: {error.message}</p>}
  </div>
  );
}

export default App;
