import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './RegionMap.css';

const RegionMap = () => {
    const navigate = useNavigate();
    const [selectedRegion, setSelectedRegion] = useState(null);
    const [hoveredRegion, setHoveredRegion] = useState(null);

    const regions = [
        {
            id: 'kanto',
            name: 'Kanto',
            generation: 1,
            pokedexRange: '001-151',
            color: '#E53935',
            description: 'The original region featuring the classic 151 Pokémon. Home to iconic cities like Pallet Town and the Indigo Plateau.',
            landmarks: ['Pallet Town', 'Viridian Forest', 'Mt. Moon', 'Cerulean Cave', 'Pokémon Tower']
        },
        {
            id: 'johto',
            name: 'Johto',
            generation: 2,
            pokedexRange: '152-251',
            color: '#8E24AA',
            description: 'A region rich in history and tradition, connected to Kanto. Known for the Burned Tower and legendary beasts.',
            landmarks: ['New Bark Town', 'Sprout Tower', 'Burned Tower', 'Whirl Islands', 'Mt. Silver']
        },
        {
            id: 'hoenn',
            name: 'Hoenn',
            generation: 3,
            pokedexRange: '252-386',
            color: '#43A047',
            description: 'A tropical region with vast oceans and diverse ecosystems. Famous for the Weather Trio.',
            landmarks: ['Littleroot Town', 'Sky Pillar', 'Sootopolis City', 'Cave of Origin', 'Battle Frontier']
        },
        {
            id: 'sinnoh',
            name: 'Sinnoh',
            generation: 4,
            pokedexRange: '387-493',
            color: '#1E88E5',
            description: 'A northern region with snowy mountains and ancient myths. Home to the Creation Trio.',
            landmarks: ['Twinleaf Town', 'Spear Pillar', 'Distortion World', 'Snowpoint Temple', 'Mt. Coronet']
        },
        {
            id: 'unova',
            name: 'Unova',
            generation: 5,
            pokedexRange: '494-649',
            color: '#FDD835',
            description: 'A diverse urban region inspired by New York. Features the Tao Trio and the unique Pokémon Musical.',
            landmarks: ['Nuvema Town', 'Castelia City', 'Dragonspiral Tower', 'Giant Chasm', 'Liberty Garden']
        },
        {
            id: 'kalos',
            name: 'Kalos',
            generation: 6,
            pokedexRange: '650-721',
            color: '#F06292',
            description: 'An elegant region inspired by France. Introduced Mega Evolution and the fairy type.',
            landmarks: ['Vaniville Town', 'Lumiose City', 'Tower of Mastery', 'Team Flare HQ', 'Terminus Cave']
        },
        {
            id: 'alola',
            name: 'Alola',
            generation: 7,
            pokedexRange: '722-809',
            color: '#26C6DA',
            description: 'A tropical archipelago with unique regional variants. Features Island Trials and Z-Moves.',
            landmarks: ['Melemele Island', 'Akala Island', 'Ula\'ula Island', 'Aether Paradise', 'Mount Lanakila']
        },
        {
            id: 'galar',
            name: 'Galar',
            generation: 8,
            pokedexRange: '810-905',
            color: '#7E57C2',
            description: 'An industrial region inspired by the UK. Home to Dynamax phenomena and the Wild Area.',
            landmarks: ['Postwick', 'Wyndon Stadium', 'Wild Area', 'Crown Tundra', 'Isle of Armor']
        },
        {
            id: 'paldea',
            name: 'Paldea',
            generation: 9,
            pokedexRange: '906-1025',
            color: '#FF7043',
            description: 'An open-world region with three storylines. Features Terastallization and the Great Crater.',
            landmarks: ['Cabo Poco', 'Mesagoza', 'Area Zero', 'Naranja Academy', 'Uva Academy']
        }
    ];

    const handleRegionClick = (region) => {
        setSelectedRegion(region.id === selectedRegion?.id ? null : region);
    };

    return (
        <div className="region-map-container">
            <div className="map-frame">
                {/* Header */}
                <div className="map-header">
                    <div className="radar-decoration">
                        <div className="radar-ring"></div>
                        <div className="radar-ring"></div>
                        <div className="radar-sweep"></div>
                    </div>
                    <h1 className="map-title">REGIONAL DATABASE</h1>
                    <p className="map-subtitle">Pokémon World Navigator</p>
                </div>

                {/* Region Grid */}
                <div className="regions-grid">
                    {regions.map((region) => (
                        <div
                            key={region.id}
                            className={`region-card ${selectedRegion?.id === region.id ? 'selected' : ''} ${hoveredRegion === region.id ? 'hovered' : ''}`}
                            style={{ '--region-color': region.color }}
                            onClick={() => handleRegionClick(region)}
                            onMouseEnter={() => setHoveredRegion(region.id)}
                            onMouseLeave={() => setHoveredRegion(null)}
                        >
                            <div className="region-glow"></div>
                            <div className="region-content">
                                <div className="generation-badge">Gen {region.generation}</div>
                                <h2 className="region-name">{region.name}</h2>
                                <div className="pokedex-range">
                                    <span className="range-icon">📋</span>
                                    <span>#{region.pokedexRange}</span>
                                </div>
                            </div>
                            <div className="region-line" style={{ backgroundColor: region.color }}></div>
                        </div>
                    ))}
                </div>

                {/* Region Details Panel */}
                {selectedRegion && (
                    <div className="region-details">
                        <div className="details-header" style={{ borderColor: selectedRegion.color }}>
                            <h2>{selectedRegion.name} Region</h2>
                            <span className="gen-label">Generation {selectedRegion.generation}</span>
                            <button className="close-btn" onClick={() => setSelectedRegion(null)}>×</button>
                        </div>
                        <div className="details-content">
                            <p className="region-description">{selectedRegion.description}</p>
                            <div className="landmarks-section">
                                <h3>Notable Landmarks</h3>
                                <div className="landmarks-list">
                                    {selectedRegion.landmarks.map((landmark, index) => (
                                        <span
                                            key={index}
                                            className="landmark-tag"
                                            style={{ borderColor: selectedRegion.color }}
                                        >
                                            📍 {landmark}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="details-stats">
                                <div className="stat-item">
                                    <span className="stat-label">Pokédex Range</span>
                                    <span className="stat-value" style={{ color: selectedRegion.color }}>
                                        #{selectedRegion.pokedexRange}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Controls */}
                <div className="map-controls">
                    <button className="control-btn back-btn" onClick={() => navigate('/')}>
                        ◀ Pokédex
                    </button>
                    <button className="control-btn team-btn" onClick={() => navigate('/team')}>
                        My Team ▶
                    </button>
                </div>

                {/* Decorative Elements */}
                <div className="corner-decoration top-left"></div>
                <div className="corner-decoration top-right"></div>
                <div className="corner-decoration bottom-left"></div>
                <div className="corner-decoration bottom-right"></div>
            </div>
        </div>
    );
};

export default RegionMap;
