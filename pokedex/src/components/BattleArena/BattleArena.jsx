import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTeam } from '../../context/TeamContext';
import { BOSSES } from '../../data/bosses';
import './BattleArena.css';

const BattleArena = () => {
    const { team } = useTeam();
    const navigate = useNavigate();
    
    // --- AUDIO REFS ---
    // Using a reliable chiptune placeholder URL
    const BGM_URL = "https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/132.ogg"; // Placeholder loop
    // Note: In a real scenario, use a proper BGM file. For now, we simulate with a loop or user provided asset.
    // Since I cannot upload MP3s, I will use a logic that tries to play a sound, but mainly relies on the user adding a file.
    // However, I will use a trick: Using a short base64 beep sequence for interactions if needed, but for BGM:
    // I'll leave the ref ready.
    
    const musicRef = useRef(new Audio()); 
    const cryRef = useRef(new Audio());
    const [isMuted, setIsMuted] = useState(false);

    // --- STATES ---
    const [phase, setPhase] = useState('lobby'); // lobby, loading, intro, battle, victory, defeat
    
    // Tower State
    const [floor, setFloor] = useState(1);
    const [activeTeam, setActiveTeam] = useState([]);
    const [selectedTeamIds, setSelectedTeamIds] = useState([]);
    const [currentFighterIndex, setCurrentFighterIndex] = useState(0);
    
    // Battle State
    const [enemyPokemon, setEnemyPokemon] = useState(null);
    const [enemyMoves, setEnemyMoves] = useState([]);
    const [playerMoves, setPlayerMoves] = useState([]);
    const [dialogText, setDialogText] = useState("");
    const [turn, setTurn] = useState('player');
    const [isAnimating, setIsAnimating] = useState(false);
    const [bossData, setBossData] = useState(null);

    // Animation States
    const [showTrainer, setShowTrainer] = useState(false);
    const [throwBall, setThrowBall] = useState(false);
    const [flash, setFlash] = useState(false);
    const [showEnemySprite, setShowEnemySprite] = useState(false);

    // --- AUDIO LOGIC ---
    useEffect(() => {
        // Simple BGM Logic
        if (phase === 'battle' || phase === 'intro') {
             // Using a placeholder chiptune URL from a public CDN for demo purposes
             // In production, replace with local file
             musicRef.current.src = "https://opengameart.org/sites/default/files/battleThemeA.mp3"; 
             musicRef.current.loop = true;
             musicRef.current.volume = 0.3;
             if (!isMuted) musicRef.current.play().catch(e => console.log("Autoplay blocked"));
        } else {
            musicRef.current.pause();
            musicRef.current.currentTime = 0;
        }
        return () => {
            musicRef.current.pause();
        }
    }, [phase, isMuted]);

    const toggleMute = () => {
        setIsMuted(!isMuted);
        if (!isMuted) musicRef.current.pause();
        else if (phase === 'battle') musicRef.current.play();
    };

    const playCry = (id) => {
        if (isMuted) return;
        try {
            cryRef.current.src = `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${id}.ogg`;
            cryRef.current.volume = 0.5;
            cryRef.current.play().catch(e => console.log("Audio play failed", e));
        } catch (e) {
            console.error("Cry error", e);
        }
    };

    // --- HELPER FUNCTIONS ---
    
    // Get Gen 5 Animated Sprite URL
    const getAnimatedSprite = (id, isBack = false) => {
        if (id > 649) {
            // Gen 6+ don't have Gen 5 animated sprites, fallback to static
            return isBack 
                ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/${id}.png`
                : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
        }
        return isBack
            ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/back/${id}.gif`
            : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${id}.gif`;
    };

    const fetchBaseSpecies = async (speciesUrl) => {
        try {
            const res = await fetch(speciesUrl);
            const data = await res.json();
            if (data.evolves_from_species) {
                return fetchBaseSpecies(data.evolves_from_species.url);
            } else {
                return data;
            }
        } catch (e) {
            console.error("Error fetching species", e);
            return null;
        }
    };

    const calculateStats = (baseStats, level) => {
        // BALANCED FORMULA
        // HP: (Base * 2 * Level / 100) + Level + 10
        // Other: (Base * 2 * Level / 100) + 5
        const multiplier = level / 100; 
        return {
            maxHp: Math.floor((baseStats.hp * 2 * multiplier) + level + 10),
            attack: Math.floor((baseStats.attack * 2 * multiplier) + 5),
            defense: Math.floor((baseStats.defense * 2 * multiplier) + 5),
            speed: Math.floor((baseStats.speed * 2 * multiplier) + 5)
        };
    };

    const fetchMoves = async (pokemonId) => {
        try {
            const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
            const data = await res.json();
            const allMoves = data.moves;
            const selectedMoves = [];
            
            // Shuffle moves
            for (let i = allMoves.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [allMoves[i], allMoves[j]] = [allMoves[j], allMoves[i]];
            }

            // Pick 4 moves that have power (attacks)
            let movesFound = 0;
            for (let i = 0; i < allMoves.length && movesFound < 4; i++) {
                const moveRes = await fetch(allMoves[i].move.url);
                const moveData = await moveRes.json();
                if (moveData.power && moveData.power > 0) {
                    selectedMoves.push({
                        name: moveData.name.replace(/-/g, ' '),
                        power: moveData.power,
                        type: moveData.type.name,
                        accuracy: moveData.accuracy || 100
                    });
                    movesFound++;
                }
            }
            
            if (selectedMoves.length === 0) {
                selectedMoves.push({ name: "Forcejeo", power: 50, type: "normal", accuracy: 100 });
            }
            return selectedMoves;
        } catch (error) {
            return [{ name: "Placaje", power: 40, type: "normal", accuracy: 100 }];
        }
    };

    // --- GAME LOGIC ---

    const toggleTeamSelection = (id) => {
        if (selectedTeamIds.includes(id)) {
            setSelectedTeamIds(selectedTeamIds.filter(pid => pid !== id));
        } else {
            if (selectedTeamIds.length < 3) {
                setSelectedTeamIds([...selectedTeamIds, id]);
            }
        }
    };

    const startTowerRun = async () => {
        if (selectedTeamIds.length !== 3 && team.length >= 3) {
            alert("Por favor selecciona exactamente 3 Pokémon.");
            return;
        }

        setPhase('loading');
        setDialogText("Inicializando Torre de Batalla... Reajustando niveles...");

        const newActiveTeam = [];
        const teamToProcess = team.length > 0 ? team.filter(p => selectedTeamIds.includes(p.id)) : [
            { id: 25, name: 'pikachu', types: ['electric'] },
            { id: 4, name: 'charmander', types: ['fire'] },
            { id: 7, name: 'squirtle', types: ['water'] }
        ];

        for (const p of teamToProcess) {
            try {
                const pRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${p.id}`);
                const pData = await pRes.json();
                const speciesRes = await fetch(pData.species.url);
                const speciesData = await speciesRes.json();
                const baseSpecies = await fetchBaseSpecies(speciesData.evolves_from_species ? speciesData.evolves_from_species.url : pData.species.url);
                const baseRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${baseSpecies.id}`);
                const baseData = await baseRes.json();
                const stats = calculateStats({
                    hp: baseData.stats[0].base_stat,
                    attack: baseData.stats[1].base_stat,
                    defense: baseData.stats[2].base_stat,
                    speed: baseData.stats[5].base_stat
                }, 5);
                const moves = await fetchMoves(baseData.id);

                newActiveTeam.push({
                    originalId: p.id,
                    baseId: baseData.id,
                    name: baseData.name,
                    level: 5,
                    currentHp: stats.maxHp,
                    maxHp: stats.maxHp,
                    stats: stats,
                    moves: moves,
                    image: getAnimatedSprite(baseData.id, true), // Back Animated
                    frontImage: getAnimatedSprite(baseData.id, false), // Front Animated (for UI)
                    isFainted: false
                });
            } catch (e) {
                console.error("Error preparing pokemon", e);
            }
        }

        setActiveTeam(newActiveTeam);
        setCurrentFighterIndex(0);
        setFloor(1);
        await generateEnemy(1, newActiveTeam);
    };

    const generateEnemy = async (currentFloor, currentTeam) => {
        setPhase('loading');
        setBossData(null);
        setShowTrainer(false);
        setThrowBall(false);
        setFlash(false);
        setShowEnemySprite(false);
        
        const isBossFloor = currentFloor % 5 === 0;
        let enemyId;
        
        // BALANCED LEVEL SCALING
        // Floor 1: Lvl 5
        // Floor 10: Lvl 14
        // Floor 50: Lvl 55
        let enemyLevel = Math.floor(5 + (currentFloor - 1) * 1.2);
        
        let eName = "Wild Pokemon";
        let eMoves = [];
        let eStats = {};
        let eImage = "";
        let bossInfo = null;

        if (isBossFloor) {
            const bossIndex = (currentFloor / 5) - 1;
            bossInfo = BOSSES[bossIndex % BOSSES.length];
            setBossData(bossInfo);
            enemyId = bossInfo.pokemonIds[Math.floor(Math.random() * bossInfo.pokemonIds.length)];
            eName = bossInfo.name;
            setDialogText(`¡${bossInfo.name} te desafía!`);
            enemyLevel += 2; // Boss is slightly stronger
        } else {
            // Random Gen 1-5 Pokemon
            enemyId = Math.floor(Math.random() * 649) + 1;
            setDialogText(`¡Un entrenador aparece!`);
        }

        try {
            const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${enemyId}`);
            const data = await res.json();
            eMoves = await fetchMoves(enemyId);
            eStats = calculateStats({
                hp: data.stats[0].base_stat,
                attack: data.stats[1].base_stat,
                defense: data.stats[2].base_stat,
                speed: data.stats[5].base_stat
            }, enemyLevel);
            eImage = getAnimatedSprite(enemyId, false); // Front Animated

            setEnemyPokemon({
                id: enemyId,
                name: data.name,
                level: enemyLevel,
                currentHp: eStats.maxHp,
                maxHp: eStats.maxHp,
                stats: eStats,
                image: eImage
            });
            setEnemyMoves(eMoves);
            setPlayerMoves(currentTeam[currentFighterIndex].moves);
            
            // --- INTRO SEQUENCE ---
            setPhase('intro');
            
            // 1. Trainer Slides In
            setTimeout(() => {
                setShowTrainer(true);
                setDialogText(bossInfo ? `"${bossInfo.quote}"` : "¡A luchar!");
            }, 500);

            // 2. Throw Ball
            setTimeout(() => {
                setThrowBall(true);
            }, 2500);

            // 3. Flash & Pokemon Appears
            setTimeout(() => {
                setFlash(true);
                setShowTrainer(false); // Trainer leaves
                setShowEnemySprite(true);
                playCry(enemyId); // PLAY SOUND
            }, 3300);

            // 4. Start Battle
            setTimeout(() => {
                setPhase('battle');
                setTurn('player');
                setDialogText(`¡${data.name} enemigo apareció!`);
                setFlash(false);
            }, 4000);

        } catch (e) {
            console.error("Error generating enemy", e);
        }
    };

    const handleAttack = (move) => {
        if (turn !== 'player' || isAnimating) return;
        setIsAnimating(true);

        const attacker = activeTeam[currentFighterIndex];
        const defender = enemyPokemon;

        setDialogText(`${attacker.name} usa ${move.name}!`);

        setTimeout(() => {
            // Damage Formula (Simplified Gen 5)
            // ((2 * Level / 5 + 2) * Power * A / D) / 50 + 2
            const levelFactor = (2 * attacker.level / 5) + 2;
            const statRatio = attacker.stats.attack / defender.stats.defense;
            let damage = Math.floor(((levelFactor * move.power * statRatio) / 50) + 2);
            
            // Random variance (0.85 - 1.0)
            damage = Math.floor(damage * (Math.random() * 0.15 + 0.85));

            const newHp = Math.max(0, defender.currentHp - damage);
            setEnemyPokemon(prev => ({...prev, currentHp: newHp}));

            if (newHp === 0) {
                setTimeout(() => handleVictory(), 1000);
            } else {
                setTimeout(() => enemyTurn(newHp), 1500);
            }
        }, 1000);
    };

    const enemyTurn = (currentEnemyHp) => {
        setTurn('enemy');
        const move = enemyMoves[Math.floor(Math.random() * enemyMoves.length)];
        setDialogText(`¡El enemigo usa ${move.name}!`);

        setTimeout(() => {
            const attacker = enemyPokemon;
            const defender = activeTeam[currentFighterIndex];
            
            const levelFactor = (2 * attacker.level / 5) + 2;
            const statRatio = attacker.stats.attack / defender.stats.defense;
            let damage = Math.floor(((levelFactor * move.power * statRatio) / 50) + 2);
            damage = Math.floor(damage * (Math.random() * 0.15 + 0.85));

            const newHp = Math.max(0, defender.currentHp - damage);

            const updatedTeam = [...activeTeam];
            updatedTeam[currentFighterIndex].currentHp = newHp;
            if (newHp === 0) updatedTeam[currentFighterIndex].isFainted = true;
            setActiveTeam(updatedTeam);

            if (newHp === 0) {
                if (updatedTeam.every(p => p.isFainted)) {
                    setPhase('defeat');
                    setDialogText("¡Tu equipo ha sido derrotado!");
                    setIsAnimating(false);
                } else {
                    setDialogText(`¡${defender.name} se debilitó!`);
                    const nextIndex = updatedTeam.findIndex(p => !p.isFainted);
                    if (nextIndex !== -1) {
                        setTimeout(() => {
                            setCurrentFighterIndex(nextIndex);
                            setPlayerMoves(updatedTeam[nextIndex].moves);
                            setTurn('player');
                            setDialogText(`¡Adelante ${updatedTeam[nextIndex].name}!`);
                            playCry(updatedTeam[nextIndex].baseId); // Play cry on switch
                            setIsAnimating(false);
                        }, 2000);
                    }
                }
            } else {
                setTurn('player');
                setDialogText(`¿Qué hará ${defender.name}?`);
                setIsAnimating(false);
            }
        }, 1000);
    };

    const handleVictory = () => {
        setDialogText("¡Enemigo derrotado!");
        setIsAnimating(false);
        setPhase('victory');
        
        // Level Up Logic
        const updatedTeam = activeTeam.map(p => {
            if (!p.isFainted) {
                // Guaranteed Level Up per win to keep up with scaling
                const newLevel = p.level + 1;
                
                // Recalculate stats for new level
                // We need base stats, but we stored calculated stats. 
                // Approximation: Scale current stats
                const growthFactor = 1.05; // 5% growth approx
                
                return {
                    ...p,
                    level: newLevel,
                    // Heal 40% of max HP after battle
                    currentHp: Math.min(Math.floor(p.maxHp * growthFactor), p.currentHp + Math.floor(p.maxHp * 0.4)),
                    maxHp: Math.floor(p.maxHp * growthFactor),
                    stats: {
                        attack: Math.floor(p.stats.attack * growthFactor),
                        defense: Math.floor(p.stats.defense * growthFactor),
                        speed: Math.floor(p.stats.speed * growthFactor)
                    }
                };
            }
            return p;
        });
        setActiveTeam(updatedTeam);
    };

    const nextFloor = () => {
        setFloor(prev => prev + 1);
        generateEnemy(floor + 1, activeTeam);
    };

    const getHpColor = (current, max) => {
        const pct = (current / max) * 100;
        return pct > 50 ? 'green' : pct > 20 ? 'yellow' : 'red';
    };

    // --- RENDER ---

    if (phase === 'lobby') {
        return (
            <div className="battle-container">
                <div className="battle-lobby">
                    <h1 className="lobby-title">TORRE DE BATALLA</h1>
                    <p className="lobby-subtitle">Selecciona 3 Pokémon. Comenzarán en Nv. 5 (Forma Base).</p>
                    <div className="selection-grid">
                        {team.map(p => (
                            <div 
                                key={p.id} 
                                className={`fighter-card ${selectedTeamIds.includes(p.id) ? 'selected' : ''} ${selectedTeamIds.length >= 3 && !selectedTeamIds.includes(p.id) ? 'disabled' : ''}`}
                                onClick={() => toggleTeamSelection(p.id)}
                            >
                                {selectedTeamIds.includes(p.id) && <div className="selection-badge">✓</div>}
                                <img src={p.image} alt={p.name} />
                                <p>{p.name}</p>
                            </div>
                        ))}
                        {team.length === 0 && <p>No tienes Pokémon. Se usarán de alquiler.</p>}
                    </div>
                    <button 
                        className="start-battle-btn" 
                        onClick={startTowerRun}
                        disabled={team.length > 0 && selectedTeamIds.length !== 3}
                    >
                        {team.length > 0 ? `COMENZAR (${selectedTeamIds.length}/3)` : "COMENZAR (ALQUILER)"}
                    </button>
                </div>
            </div>
        );
    }

    if (phase === 'loading') {
        return (
            <div className="battle-container">
                <div style={{color: 'white', fontFamily: 'Orbitron'}}>
                    <h2>CARGANDO PISO {floor}...</h2>
                </div>
            </div>
        );
    }

    const currentPlayer = activeTeam[currentFighterIndex];

    return (
        <div className="battle-container">
            <div className={`arena-frame ${bossData ? 'boss-mode' : ''}`}>
                
                {/* Header */}
                <div className="tower-header">
                    <span className="floor-counter">PISO {floor}</span>
                    {bossData && <span className="boss-alert">⚠ JEFE: {bossData.name.toUpperCase()} ⚠</span>}
                    <button className="sound-control" onClick={toggleMute}>
                        {isMuted ? "🔇" : "🔊"}
                    </button>
                </div>

                {/* Scene */}
                <div className={`battle-scene ${bossData ? 'boss-bg' : ''}`}>
                    
                    {/* --- INTRO ANIMATION ELEMENTS --- */}
                    {phase === 'intro' && (
                        <>
                            {/* Generic Trainer Sprite */}
                            <img 
                                src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/trainers/red.png" 
                                onError={(e) => e.target.src = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/substitute.png"}
                                className={`trainer-sprite ${showTrainer ? 'enter' : 'leave'}`}
                                alt="Trainer"
                            />
                            <div className={`pokeball-projectile ${throwBall ? 'throw' : ''}`}></div>
                            <div className={`summon-flash ${flash ? 'active' : ''}`}></div>
                        </>
                    )}

                    {/* Enemy */}
                    <div className={`hud enemy ${phase === 'battle' ? 'visible' : ''}`}>
                        <div className="hud-info">
                            <span className="hud-name">{enemyPokemon?.name}</span>
                            <span className="hud-lvl">Nv{enemyPokemon?.level}</span>
                        </div>
                        <div className="hp-bar-container">
                            <div className={`hp-bar-fill ${getHpColor(enemyPokemon?.currentHp, enemyPokemon?.maxHp)}`} style={{width: `${(enemyPokemon?.currentHp/enemyPokemon?.maxHp)*100}%`}}></div>
                        </div>
                    </div>
                    
                    {(phase === 'battle' || showEnemySprite) && (
                        <img 
                            src={enemyPokemon?.image} 
                            className={`sprite enemy ${showEnemySprite ? 'appearing' : ''} ${turn === 'enemy' && isAnimating ? 'attack-anim' : ''} ${turn === 'player' && isAnimating ? 'hit-anim' : ''}`} 
                        />
                    )}
                    
                    <div className="platform enemy"></div>

                    {/* Player */}
                    <div className={`hud player ${phase === 'battle' ? 'visible' : ''}`}>
                        <div className="hud-info">
                            <span className="hud-name">{currentPlayer.name}</span>
                            <span className="hud-lvl">Nv{currentPlayer.level}</span>
                        </div>
                        <div className="hp-bar-container">
                            <div className={`hp-bar-fill ${getHpColor(currentPlayer.currentHp, currentPlayer.maxHp)}`} style={{width: `${(currentPlayer.currentHp/currentPlayer.maxHp)*100}%`}}></div>
                        </div>
                        <div className="hp-text">{currentPlayer.currentHp}/{currentPlayer.maxHp}</div>
                        
                        <div className="team-preview">
                            {activeTeam.map((p, idx) => (
                                <div key={idx} className={`mini-poke ${idx === currentFighterIndex ? 'active' : ''} ${p.isFainted ? 'fainted' : ''}`}>
                                    <img src={p.frontImage} style={{width:'100%', height:'100%'}} />
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    {(phase === 'battle' || phase === 'intro') && (
                        <img src={currentPlayer.image} className={`sprite player ${turn === 'player' && isAnimating ? 'attack-anim' : ''} ${turn === 'enemy' && isAnimating ? 'hit-anim' : ''}`} />
                    )}
                    
                    <div className="platform player"></div>
                </div>

                {/* UI */}
                <div className="battle-ui">
                    <div className="dialog-box">
                        {dialogText}
                    </div>
                    {phase === 'battle' && turn === 'player' && (
                        <div className="action-menu">
                            {playerMoves.map((move, idx) => (
                                <button key={idx} className="move-btn" onClick={() => handleAttack(move)}>
                                    {move.name}
                                    <span style={{fontSize:'0.6rem', color:'#666'}}>{move.type}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Overlays */}
                {phase === 'victory' && (
                    <div className="result-overlay">
                        <h2 className="result-title">¡VICTORIA!</h2>
                        <p className="xp-gain">¡Tus Pokémon suben al Nivel {currentPlayer.level + 1}!</p>
                        <button className="next-btn" onClick={nextFloor}>SIGUIENTE PISO ▶</button>
                    </div>
                )}

                {phase === 'defeat' && (
                    <div className="result-overlay">
                        <h2 className="result-title" style={{color:'#F44336'}}>DERROTA...</h2>
                        <p className="xp-gain">Llegaste al Piso {floor}</p>
                        <button className="next-btn" onClick={() => setPhase('lobby')}>VOLVER AL LOBBY</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BattleArena;
