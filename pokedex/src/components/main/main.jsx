import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './main.css';

const Main = () => {
    const [pokemons, setPokemons] = useState([]);
    const [filteredPokemons, setFilteredPokemons] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handlePokeClick = (id) => {
        navigate(`/pokemon/${id}`);
    };

    useEffect(() => {
        const fetchPokemons = async () => {
            try {
                // Fetching all pokemon for client-side filtering
                const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1025');
                if (!response.ok) throw new Error('No se pudo conectar con la PokeAPI');

                const data = await response.json();

                const formattedData = data.results.map((pokemon) => {
                    const id = pokemon.url.split('/').filter(Boolean).pop();
                    return {
                        name: pokemon.name,
                        id: parseInt(id),
                        image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`
                    };
                });

                setPokemons(formattedData);
                setFilteredPokemons(formattedData);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchPokemons();
    }, []);

    // Filter effect
    useEffect(() => {
        const results = pokemons.filter(pokemon =>
            pokemon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pokemon.id.toString().includes(searchTerm)
        );
        setFilteredPokemons(results);
    }, [searchTerm, pokemons]);

    if (loading) return (
        <div className="main-container">
            <div className="loading-container">
                <div className="pokeball-spinner"></div>
                <p>INITIALIZING POKEDEX DATABASE...</p>
            </div>
        </div>
    );

    if (error) return <div className="error">Error: {error}</div>;

    return (
        <div className="main-container">
            <div className="pokedex-frame">
                {/* Header with Search */}
                <div className="main-header">
                    <h1 className="main-title">National Pokédex</h1>
                    <div className="search-container">
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search Pokémon by name or ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Grid Area */}
                <div className="pokemon-grid-area">
                    <div className="pokemon-grid">
                        {filteredPokemons.map((pokemon) => (
                            <div
                                key={pokemon.id}
                                className="pokemon-card"
                                onClick={() => handlePokeClick(pokemon.id)}
                            >
                                <span className="card-id">#{String(pokemon.id).padStart(4, '0')}</span>
                                <div className="card-image-container">
                                    <img
                                        src={pokemon.image}
                                        alt={pokemon.name}
                                        className="card-image"
                                        loading="lazy"
                                    />
                                </div>
                                <h2 className="card-name">{pokemon.name}</h2>
                            </div>
                        ))}
                        {filteredPokemons.length === 0 && (
                            <div className="no-results">
                                <p>No Pokémon found matching "{searchTerm}"</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Main;
