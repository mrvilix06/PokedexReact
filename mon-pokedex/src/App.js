import React, { useState, useEffect, useRef } from 'react';
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
  const [allPokemon, setAllPokemon] = useState([]);
  const [displayedPokemon, setDisplayedPokemon] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [index, setIndex] = useState(21);
  const chargementRef = useRef(null);


  useEffect(() => {
    fetchPokemonBase();
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [index]);

  const handleScroll = () => {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    if (clientHeight + scrollTop >= scrollHeight - 20) {
      addPoke(6);
    }
  };

  const addPoke = (nb) => {
    if (index > 151) return;
    const arrToAdd = allPokemon.slice(index, index + nb);
    setDisplayedPokemon([...displayedPokemon, ...arrToAdd]);
    setIndex(index + nb);
  };


  const fetchPokemonBase = () => {
    fetch("https://pokeapi.co/api/v2/pokemon?limit=151")
    .then(reponse => reponse.json())
    .then((allPoke) => {
        allPoke.results.forEach((pokemon) => {
            fetchPokemonComplet(pokemon);
        })
    })

  };

  useEffect(() => {
    if (allPokemon.length === 151) {
      const tableauFin = allPokemon.sort((a, b) => a.id - b.id).slice(0, 21);
      setDisplayedPokemon(tableauFin);
      if (chargementRef.current) {
        chargementRef.current.style.display = "none";
      }
    }
  }, [allPokemon]);

  const fetchPokemonComplet = (pokemon) => {
    let objPokemonFull = {};
    let url = pokemon.url;
    let nameP = pokemon.name;

    fetch(url)
        .then(reponse => reponse.json())
        .then((pokeData) => {
            objPokemonFull.pic = pokeData.sprites.front_default;
            objPokemonFull.type = pokeData.types[0].type.name;
            objPokemonFull.id = pokeData.id;

            fetch(`https://pokeapi.co/api/v2/pokemon-species/${nameP}`)
                .then(reponse => reponse.json())
                .then((pokeData) => {
                    objPokemonFull.name = pokeData.names[4].name;
                    setAllPokemon(currentList => [...currentList, objPokemonFull]);
                })
        })
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    // ... (même code que dans votre code JavaScript pour la recherche)
  };

  return (
    <div className="App">
      <h1>Pokedex</h1>
      <form className="recherche-poke">
        <label htmlFor="recherche">Rechercher un pokémon</label>
        <input type="text" id="recherche" value={searchTerm} onChange={handleSearch} />
      </form>
      <div className="loader" ref={chargementRef}>
        <img src="pokeball.png" alt="pokeball" />
      </div>
      <div className="container">
      <ul className="liste-poke">
        {displayedPokemon.map((poke, index) => (
          <li key={index} style={{ background: types[poke.type] }}>
            <img src={poke.pic} alt={poke.name} />
            <h5>{poke.name}</h5>
            <p>ID# {poke.id}</p>
          </li>
        ))}
      </ul>
      </div>
    </div>
  );
}

export default App;
