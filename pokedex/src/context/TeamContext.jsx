import React, { createContext, useState, useEffect, useContext } from 'react';

const TeamContext = createContext();

export const useTeam = () => useContext(TeamContext);

export const TeamProvider = ({ children }) => {
    const [team, setTeam] = useState(() => {
        const savedTeam = localStorage.getItem('myPokemonTeam');
        return savedTeam ? JSON.parse(savedTeam) : [];
    });

    useEffect(() => {
        localStorage.setItem('myPokemonTeam', JSON.stringify(team));
    }, [team]);

    const addToTeam = (pokemon) => {
        if (team.length >= 6) {
            alert("¡Tu equipo está lleno! (Máximo 6 Pokémon)");
            return;
        }
        if (team.some(p => p.id === pokemon.id)) {
            alert("¡Este Pokémon ya está en tu equipo!");
            return;
        }
        setTeam([...team, pokemon]);
    };

    const removeFromTeam = (pokemonId) => {
        setTeam(team.filter(p => p.id !== pokemonId));
    };

    const clearTeam = () => {
        setTeam([]);
    };

    return (
        <TeamContext.Provider value={{ team, addToTeam, removeFromTeam, clearTeam }}>
            {children}
        </TeamContext.Provider>
    );
};
