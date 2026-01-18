import React, { useState, useEffect, useRef } from 'react';
import './RotomChat.css';

const RotomChat = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, text: "¡Zzzzt! ¡Hola entrenador! Soy Rotom Dex. ¿Necesitas ayuda con tu Pokédex? ¡Pregúntame lo que sea! Rrrrotom!", sender: 'rotom' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    // Simple heuristic response logic (Simulating AI)
    const getRotomResponse = (text) => {
        const lowerText = text.toLowerCase();
        
        if (lowerText.includes('hola') || lowerText.includes('buenos')) 
            return "¡Alola! ¡Zzzzt! ¿Listo para la aventura?";
        
        if (lowerText.includes('shiny') || lowerText.includes('variocolor')) 
            return "¡Los Pokémon Shiny son súper raros! Tienen colores diferentes y brillan al salir. ¡Usa el interruptor de estrella en la tarjeta para verlos! Zzzzt!";
        
        if (lowerText.includes('mapa') || lowerText.includes('donde') || lowerText.includes('ubicación')) 
            return "¡Puedo rastrear Pokémon! Entra en la ficha de un Pokémon y pulsa 'MAP VIEW' para ver su hábitat. ¡Mi GPS es infalible! Bzzzt!";
        
        if (lowerText.includes('equipo') || lowerText.includes('team')) 
            return "¡Tu equipo puede tener hasta 6 Pokémon! Ve a la sección 'Mi Equipo' para gestionarlos. ¡Elige sabiamente para cubrir tipos!";
        
        if (lowerText.includes('fuerte') || lowerText.includes('mejor')) 
            return "¡No hay Pokémon débil si el entrenador es bueno! Pero... los dragones suelen tener estadísticas muy altas. ¡Zzzzt!";
            
        if (lowerText.includes('gracias')) 
            return "¡De nada, rrrrotom! ¡Para eso estoy!";

        // Default fallback
        return "¡Zzzzt! Interesante pregunta... Mis bases de datos sugieren que sigas explorando la Pokédex. (Nota: Soy un Rotom automático, ¡aún no tengo IA conectada al cerebro!)";
    };

    const handleSend = () => {
        if (!inputValue.trim()) return;

        // Add user message
        const userMsg = { id: Date.now(), text: inputValue, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsTyping(true);

        // Simulate Rotom thinking delay
        setTimeout(() => {
            const rotomMsg = { 
                id: Date.now() + 1, 
                text: getRotomResponse(userMsg.text), 
                sender: 'rotom' 
            };
            setMessages(prev => [...prev, rotomMsg]);
            setIsTyping(false);
        }, 1500);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') handleSend();
    };

    return (
        <>
            {/* Floating Action Button */}
            <div 
                className={`rotom-fab ${isOpen ? 'active' : ''}`} 
                onClick={() => setIsOpen(!isOpen)}
                title="Consultar a Rotom Dex"
            >
                {isOpen ? (
                    <span style={{fontSize: '2rem', color: 'white'}}>✕</span>
                ) : (
                    <img 
                        src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/479.png" 
                        alt="Rotom" 
                        className="rotom-icon" 
                    />
                )}
            </div>

            {/* Chat Window */}
            {isOpen && (
                <div className="rotom-chat-window">
                    <div className="chat-header">
                        <img 
                            src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/479.png" 
                            alt="Rotom Avatar" 
                            className="header-avatar"
                        />
                        <div className="header-info">
                            <h3>Rotom Dex</h3>
                            <span><div className="status-dot"></div> Online</span>
                        </div>
                        <button className="close-chat-btn" onClick={() => setIsOpen(false)}>×</button>
                    </div>

                    <div className="chat-messages">
                        {messages.map(msg => (
                            <div key={msg.id} className={`message ${msg.sender}`}>
                                {msg.text}
                            </div>
                        ))}
                        {isTyping && <div className="typing-indicator">Rotom está escribiendo... zzzzt...</div>}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="chat-input-area">
                        <input 
                            type="text" 
                            className="chat-input" 
                            placeholder="Pregunta a Rotom..." 
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={handleKeyPress}
                        />
                        <button className="send-btn" onClick={handleSend} disabled={isTyping}>
                            ➤
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default RotomChat;
