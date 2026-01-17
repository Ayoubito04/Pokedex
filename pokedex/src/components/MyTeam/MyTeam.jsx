import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTeam } from '../../context/TeamContext';
import './MyTeam.css';

const MyTeam = () => {
    const { team, removeFromTeam, clearTeam } = useTeam();
    const navigate = useNavigate();

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

    // Generate empty slots
    const emptySlots = Array(6 - team.length).fill(null);

    return (
        <div className="my-team-container">
            <div className="team-frame">
                {/* Header */}
                <div className="team-header">
                    <div className="header-decoration">
                        <span className="hex-light"></span>
                        <span className="hex-light"></span>
                        <span className="hex-light"></span>
                    </div>
                    <h1 className="team-title">TRAINER'S TEAM</h1>
                    <div className="trainer-info">
                        <span className="trainer-id">ID: #05721</span>
                        <span className="team-count">{team.length}/6 Pokémon</span>
                    </div>
                </div>

                {/* Team Grid */}
                <div className="team-grid">
                    {team.map((pokemon) => (
                        <div
                            key={pokemon.id}
                            className="team-slot filled"
                            style={{
                                background: `linear-gradient(135deg, ${getTypeColor(pokemon.types?.[0])}33, ${getTypeColor(pokemon.types?.[pokemon.types.length - 1] || pokemon.types?.[0])}33)`
                            }}
                        >
                            <button
                                className="remove-btn"
                                onClick={() => removeFromTeam(pokemon.id)}
                                title="Remove from team"
                            >
                                ×
                            </button>
                            <div className="slot-number">#{String(pokemon.id).padStart(3, '0')}</div>
                            <div className="pokemon-sprite-container">
                                <img
                                    src={pokemon.image}
                                    alt={pokemon.name}
                                    className="pokemon-sprite"
                                    onClick={() => navigate(`/pokemon/${pokemon.id}`)}
                                />
                            </div>
                            <h3 className="pokemon-name">{pokemon.name}</h3>
                            <div className="pokemon-types">
                                {pokemon.types?.map((type, index) => (
                                    <span
                                        key={index}
                                        className="mini-type"
                                        style={{ backgroundColor: getTypeColor(type) }}
                                    >
                                        {type}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}

                    {/* Empty Slots */}
                    {emptySlots.map((_, index) => (
                        <div key={`empty-${index}`} className="team-slot empty">
                            <div className="empty-icon">
                                <div className="pokeball-outline"></div>
                            </div>
                            <p className="empty-text">Empty Slot</p>
                        </div>
                    ))}
                </div>

                {/* Controls */}
                <div className="team-controls">
                    <button
                        className="control-btn back-btn"
                        onClick={() => navigate('/')}
                    >
                        ◀ Pokédex
                    </button>

                    {team.length > 0 && (
                        <button
                            className="control-btn clear-btn"
                            onClick={() => {
                                if (window.confirm('¿Estás seguro de que quieres liberar a todos tus Pokémon?')) {
                                    clearTeam();
                                }
                            }}
                        >
                            🗑️ Clear Team
                        </button>
                    )}

                    <button
                        className="control-btn map-btn"
                        onClick={() => navigate('/map')}
                    >
                        Regions ▶
                    </button>
                </div>

                {/* Team Stats Summary */}
                {team.length > 0 && (
                    <div className="team-summary">
                        <h3 className="summary-title">Team Analysis</h3>
                        <div className="type-coverage">
                            {[...new Set(team.flatMap(p => p.types || []))].map((type, index) => (
                                <span
                                    key={index}
                                    className="coverage-badge"
                                    style={{ backgroundColor: getTypeColor(type) }}
                                >
                                    {type}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyTeam;
