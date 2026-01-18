import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTeam } from '../../context/TeamContext';
import './PokeCard.css';

const PokeCard = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToTeam, team } = useTeam();
    
    // Data States
    const [pokemon, setPokemon] = useState(null);
    const [species, setSpecies] = useState(null);
    const [encounters, setEncounters] = useState([]);
    const [pokedexEntries, setPokedexEntries] = useState([]);
    
    // UI States
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isShiny, setIsShiny] = useState(false);
    const [viewMode, setViewMode] = useState('info'); // 'info' or 'map'
    const [currentEntryIndex, setCurrentEntryIndex] = useState(0);

    const isInTeam = team.some(p => p.id === parseInt(id));

    useEffect(() => {
        const fetchPokemonDetails = async () => {
            try {
                setLoading(true);
                // 1. Fetch basic Pokemon data
                const pokemonRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
                if (!pokemonRes.ok) throw new Error('Pokémon no encontrado');
                const pokemonData = await pokemonRes.json();

                // 2. Fetch species data for description
                const speciesRes = await fetch(pokemonData.species.url);
                const speciesData = await speciesRes.json();

                // 3. Fetch Encounters (Locations)
                const encountersRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}/encounters`);
                const encountersData = await encountersRes.json();

                // 4. Process Pokedex Entries (Spanish priority)
                const entries = speciesData.flavor_text_entries.filter(e => e.language.name === 'es');
                // Fallback to English if no Spanish
                const finalEntries = entries.length > 0 ? entries : speciesData.flavor_text_entries.filter(e => e.language.name === 'en');
                
                // Remove duplicates based on text to avoid clicking "next" and seeing same text
                const uniqueEntries = [];
                const seenTexts = new Set();
                
                finalEntries.forEach(entry => {
                    const cleanText = entry.flavor_text.replace(/[\n\f]/g, ' ');
                    if (!seenTexts.has(cleanText)) {
                        seenTexts.add(cleanText);
                        uniqueEntries.push({
                            text: cleanText,
                            version: entry.version.name
                        });
                    }
                });

                setPokemon(pokemonData);
                setSpecies(speciesData);
                setEncounters(encountersData);
                setPokedexEntries(uniqueEntries);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchPokemonDetails();
    }, [id]);

    const getTypeColor = (type) => {
        const colors = {
            normal: '#A8A878', fire: '#F08030', water: '#6890F0', electric: '#F8D030',
            grass: '#78C850', ice: '#98D8D8', fighting: '#C03028', poison: '#A040A0',
            ground: '#E0C068', flying: '#A890F0', psychic: '#F85888', bug: '#A8B820',
            rock: '#B8A038', ghost: '#705898', dragon: '#7038F8', dark: '#705848',
            steel: '#B8B8D0', fairy: '#EE99AC'
        };
        return colors[type] || '#888888';
    };

    const translateStat = (statName) => {
        const translations = {
            'hp': 'PS',
            'attack': 'Ataque',
            'defense': 'Defensa',
            'special-attack': 'Atq. Esp',
            'special-defense': 'Def. Esp',
            'speed': 'Velocidad'
        };
        return translations[statName] || statName;
    };

    const formatVersion = (versionName) => {
        if (!versionName) return 'Desconocido';
        return versionName.replace(/-/g, ' ').toUpperCase();
    };

    const handleAddToTeam = () => {
        if (pokemon) {
            const currentImage = isShiny 
                ? pokemon.sprites.other['official-artwork'].front_shiny 
                : pokemon.sprites.other['official-artwork'].front_default;

            addToTeam({
                id: pokemon.id,
                name: pokemon.name,
                image: currentImage,
                types: pokemon.types.map(t => t.type.name),
                isShiny: isShiny
            });
        }
    };

    const toggleShiny = () => setIsShiny(!isShiny);

    const nextEntry = () => {
        setCurrentEntryIndex((prev) => (prev + 1) % pokedexEntries.length);
    };

    // Helper to format location names
    const formatLocation = (slug) => {
        return slug.replace(/-/g, ' ').replace(/area/g, '').toUpperCase();
    };

    if (loading) {
        return (
            <div className="pokecard-container">
                <div className="loading-screen">
                    <div className="pokeball-loader"></div>
                    <p>Escaneando Datos...</p>
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
                        Volver a la Pokédex
                    </button>
                </div>
            </div>
        );
    }

    const currentImage = isShiny 
        ? pokemon.sprites.other['official-artwork'].front_shiny 
        : pokemon.sprites.other['official-artwork'].front_default;

    return (
        <div className="pokecard-container">
            <div className={`pokecard-frame ${isShiny ? 'shiny-mode' : ''}`}>
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
                    {/* Header */}
                    <div className="screen-header">
                        <span className="poke-number">#{String(pokemon.id).padStart(3, '0')}</span>
                        <h1 className="poke-name">
                            {pokemon.name}
                            {isShiny && <span className="shiny-icon">✨</span>}
                        </h1>
                        <div className="header-controls">
                            <button 
                                className={`mode-toggle-btn ${viewMode === 'map' ? 'active' : ''}`}
                                onClick={() => setViewMode(viewMode === 'info' ? 'map' : 'info')}
                                title="Ver Mapa"
                            >
                                {viewMode === 'info' ? '📍 MAPA' : '📊 DATOS'}
                            </button>
                            <button 
                                className={`shiny-toggle-btn ${isShiny ? 'active' : ''}`}
                                onClick={toggleShiny}
                                title="Modo Shiny"
                            >
                                {isShiny ? '★' : '☆'}
                            </button>
                        </div>
                    </div>

                    {/* Content Area - Swaps between Info and Map */}
                    {viewMode === 'info' ? (
                        <>
                            {/* Standard Info View */}
                            <div className="poke-image-section">
                                <div className={`image-frame ${isShiny ? 'shiny-frame' : ''}`} style={{
                                    background: `linear-gradient(135deg, ${getTypeColor(pokemon.types[0].type.name)}44, ${getTypeColor(pokemon.types[pokemon.types.length - 1].type.name)}44)`
                                }}>
                                    <img
                                        src={currentImage || pokemon.sprites.other['official-artwork'].front_default}
                                        alt={pokemon.name}
                                        className="poke-image"
                                    />
                                    {isShiny && <div className="shiny-sparkles"></div>}
                                </div>
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

                            <div className="stats-panel">
                                <h3 className="panel-title">Estadísticas Base</h3>
                                <div className="stats-grid">
                                    {pokemon.stats.map((stat, index) => (
                                        <div key={index} className="stat-row">
                                            <span className="stat-name">{translateStat(stat.stat.name)}</span>
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

                            <div className="info-panel">
                                <div className="info-row">
                                    <div className="info-item">
                                        <span className="info-label">Altura</span>
                                        <span className="info-value">{(pokemon.height / 10).toFixed(1)} m</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Peso</span>
                                        <span className="info-value">{(pokemon.weight / 10).toFixed(1)} kg</span>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Exp. Base</span>
                                        <span className="info-value">{pokemon.base_experience || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="description-panel">
                                <div className="desc-header">
                                    <span className="version-badge">
                                         {pokedexEntries.length > 0 ? formatVersion(pokedexEntries[currentEntryIndex].version) : 'DATA'}
                                    </span>
                                    {pokedexEntries.length > 1 && (
                                        <button className="next-entry-btn" onClick={nextEntry}>
                                            ⟳ Otra Versión
                                        </button>
                                    )}
                                </div>
                                <p className="poke-description">
                                    {pokedexEntries.length > 0 ? pokedexEntries[currentEntryIndex].text : 'No hay descripción disponible en este idioma.'}
                                </p>
                            </div>
                        </>
                    ) : (
                        /* Map / Location View */
                        <div className="location-view-container">
                            <div className="gps-header">
                                <div className="radar-animation">
                                    <div className="radar-sweep"></div>
                                </div>
                                <div className="gps-status">
                                    <span className="gps-label">SISTEMA DE RASTREO</span>
                                    <span className="gps-coords">LAT: {Math.random().toFixed(4)} LON: {Math.random().toFixed(4)}</span>
                                </div>
                            </div>

                            <div className="location-list-container">
                                {encounters.length > 0 ? (
                                    <ul className="location-list">
                                        {encounters.map((encounter, index) => (
                                            <li key={index} className="location-item">
                                                <span className="location-marker">📍</span>
                                                <div className="location-details">
                                                    <span className="location-name">
                                                        {formatLocation(encounter.location_area.name)}
                                                    </span>
                                                    <div className="version-badges">
                                                        {encounter.version_details.slice(0, 4).map((v, i) => (
                                                            <span key={i} className="version-tag">
                                                                {v.version.name}
                                                            </span>
                                                        ))}
                                                        {encounter.version_details.length > 4 && 
                                                            <span className="version-tag more">+{encounter.version_details.length - 4}</span>
                                                        }
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="no-locations">
                                        <div className="unknown-icon">?</div>
                                        <h3>HÁBITAT DESCONOCIDO</h3>
                                        <p>Este Pokémon no se encuentra en estado salvaje en la base de datos actual. Puede ser un inicial, legendario o evolución.</p>
                                    </div>
                                )}
                            </div>
                            
                            <div className="map-footer-deco">
                                <div className="deco-line"></div>
                                <span>ESCANEANDO SECTOR 0-9</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Bottom controls */}
                <div className="frame-bottom">
                    <button className="control-btn back-btn" onClick={() => navigate('/')}>
                        ◀ Volver
                    </button>
                    <button
                        className={`control-btn add-team-btn ${isInTeam ? 'in-team' : ''}`}
                        onClick={handleAddToTeam}
                        disabled={isInTeam}
                    >
                        {isInTeam ? '✓ En Equipo' : isShiny ? '+ Añadir Shiny' : '+ Añadir a Equipo'}
                    </button>
                    <button className="control-btn team-btn" onClick={() => navigate('/team')}>
                        Mi Equipo ▶
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PokeCard;
