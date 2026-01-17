import React, { useEffect, useState } from 'react';
import './main.css';
import{useNavigate} from 'react-router-dom';

const Main = () => {
  const [pokemons, setPokemons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
   const PokeClick=(id)=>{
    navigate(`/pokemon/${id}`);
   }

  useEffect(() => {
    const fetchPokemons = async () => {
      try {
        // Aumentamos el limite a 1300 para cubrir todas las generaciones y formas
        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1025');
        if (!response.ok) throw new Error('No se pudo conectar con la PokeAPI');
        
        const data = await response.json();
        
        const formattedData = data.results.map((pokemon) => {
          // Extraemos el ID de la URL: "https://pokeapi.co/api/v2/pokemon/1/" -> "1"
          const id = pokemon.url.split('/').filter(Boolean).pop();
          
          return {
            name: pokemon.name,
            id: id,
            // Imagen oficial de mayor resolución (Dream World o Home)
            image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`
          };
        });

        setPokemons(formattedData);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchPokemons();
  }, []);

  if (loading) return <div className="loader">Cargando todos los Pokémon...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <main className="container">
      <h1>Pokédex Nacional</h1>
      <div className="pokemon-grid">
        {pokemons.map((pokemon) => (
          <div key={pokemon.id} className="pokemon-card" onClick={()=>PokeClick(pokemon.id)}>
            <span className="pokemon-id">#{pokemon.id.toString().padStart(3, '0')}</span>
            <img 
              src={pokemon.image} 
              alt={pokemon.name} 
              loading="lazy" 
               style={{width: '40px', height: '40px'}}
            />
            <h2>{pokemon.name}</h2>
          </div>
        ))}
      </div>
    </main>
  );
};

export default Main;