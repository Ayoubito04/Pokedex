import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTeam } from '../../context/TeamContext';
import './PokeCard.css';

const PokeCard = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToTeam, team } = useTeam();
    const [pokemon, setPokemon] = useState(null);
    const [species, setSpecies] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const isInTeam = team.some(p => p.id === parseInt(id));

    useEffect(() => {
        const fetchPokemonDetails = async () => {
            try {
                setLoading(true);
                // Fetch basic Pokemon data
                const pokemonRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
                if (!pokemonRes.ok) throw new Error('Pokémon not found');
                const pokemonData = await pokemonRes.json();

                // Fetch species data for description
                const speciesRes = await fetch(pokemonData.species.url);
                const speciesData = await speciesRes.json();

                setPokemon(pokemonData);
                setSpecies(speciesData);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchPokemonDetails();
    }, [id]);

    const getDescription = () => {
        if (!species) return 'Loading description...';
        const entry = species.flavor_text_entries.find(
            e => e.language.name === 'en'
        );
        return entry ? entry.flavor_text.replace(/\f/g, ' ') : 'No description available.';
    };

    const getTypeColor = (type) => {
        const colors = {
            normal: '#A8A878',
            fire: '#F08030',
            water: '#6890F0',
            electric: '#F8D030',
            grass: '#78C850',
            ice: '#98D8D8',
            fighting: '#C03028',
            poison: '#A040A0',
            ground: '#E0C068',
            flying: '#A890F0',
            psychic: '#F85888',
            bug: '#A8B820',
            rock: '#B8A038',
            ghost: '#705898',
            dragon: '#7038F8',
            dark: '#705848',
            steel: '#B8B8D0',
            fairy: '#EE99AC'
        };
        return colors[type] || '#888888';
    };

    const handleAddToTeam = () => {
        if (pokemon) {
            addToTeam({
                id: pokemon.id,
                name: pokemon.name,
                image: pokemon.sprites.other['official-artwork'].front_default,
                types: pokemon.types.map(t => t.type.name)
            });
        }
    };

    if (loading) {
        return (
            <div className="pokecard-container">
                <div className="loading-screen">
                    <div className="pokeball-loader"></div>
                    <p>Scanning Pokémon Data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="pokecard-container">
                <div className="error-screen">
                    <p>⚠️ Error: {error}</p>
                    <button className="tech-btn" onClick={() => navigate('/')}>
                        Return to Pokédex
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="pokecard-container">
            <div className="pokecard-frame">
                {/* Top decorative bar */}
                <div className="frame-top">
                    <div className="frame-lights">
                        <span className="light-main"></span>
                        <span className="light-sm red"></span>
                        <span className="light-sm yellow"></span>
                        <span className="light-sm green"></span>
                    </div>
                </div>

                {/* Main screen */}
                <div className="pokecard-screen">
                    {/* Pokemon ID and Name Header */}
                    <div className="screen-header">
                        <span className="poke-number">#{String(pokemon.id).padStart(3, '0')}</span>
                        <h1 className="poke-name">{pokemon.name}</h1>
                    </div>

                    {/* Pokemon Image Section */}
                    <div className="poke-image-section">
                        <div className="image-frame" style={{
                            background: `linear-gradient(135deg, ${getTypeColor(pokemon.types[0].type.name)}44, ${getTypeColor(pokemon.types[pokemon.types.length - 1].type.name)}44)`
                        }}>
                            <img
                                src={pokemon.sprites.other['official-artwork'].front_default}
                                alt={pokemon.name}
                                className="poke-image"
                            />
                        </div>

                        {/* Types */}
                        <div className="poke-types">
                            {pokemon.types.map((typeInfo, index) => (
                                <span
                                    key={index}
                                    className="type-badge"
                                    style={{ backgroundColor: getTypeColor(typeInfo.type.name) }}
                                >
                                    {typeInfo.type.name}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Stats Panel */}
                    <div className="stats-panel">
                        <h3 className="panel-title">Base Stats</h3>
                        <div className="stats-grid">
                            {pokemon.stats.map((stat, index) => (
                                <div key={index} className="stat-row">
                                    <span className="stat-name">{stat.stat.name.replace('-', ' ')}</span>
                                    <div className="stat-bar-container">
                                        <div
                                            className="stat-bar"
                                            style={{
                                                width: `${Math.min(stat.base_stat, 255) / 255 * 100}%`,
                                                backgroundColor: stat.base_stat > 100 ? '#4CAF50' : stat.base_stat > 50 ? '#FFC107' : '#F44336'
                                            }}
                                        ></div>
                                    </div>
                                    <span className="stat-value">{stat.base_stat}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Info Panel */}
                    <div className="info-panel">
                        <div className="info-row">
                            <div className="info-item">
                                <span className="info-label">Height</span>
                                <span className="info-value">{(pokemon.height / 10).toFixed(1)} m</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Weight</span>
                                <span className="info-value">{(pokemon.weight / 10).toFixed(1)} kg</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">Base Exp</span>
                                <span className="info-value">{pokemon.base_experience || 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="description-panel">
                        <p className="poke-description">{getDescription()}</p>
                    </div>

                    {/* Abilities */}
                    <div className="abilities-panel">
                        <h3 className="panel-title">Abilities</h3>
                        <div className="abilities-list">
                            {pokemon.abilities.map((ability, index) => (
                                <span key={index} className={`ability-badge ${ability.is_hidden ? 'hidden-ability' : ''}`}>
                                    {ability.ability.name.replace('-', ' ')}
                                    {ability.is_hidden && <small> (Hidden)</small>}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom controls */}
                <div className="frame-bottom">
                    <button className="control-btn back-btn" onClick={() => navigate('/')}>
                        ◀ Back
                    </button>
                    <button
                        className={`control-btn add-team-btn ${isInTeam ? 'in-team' : ''}`}
                        onClick={handleAddToTeam}
                        disabled={isInTeam}
                    >
                        {isInTeam ? '✓ In Team' : '+ Add to Team'}
                    </button>
                    <button className="control-btn team-btn" onClick={() => navigate('/team')}>
                        My Team ▶
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PokeCard;
