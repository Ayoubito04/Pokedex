import React from 'react';
import { useNavigate } from 'react-router-dom';
import './header.css';

const Header = () => {
    const navigate = useNavigate();

    return (
        <header className="gen5-header">
            <div className="header-top-bar">
                <div className="blue-light"></div>
                <div className="status-indicators">
                    <span className="indicator red"></span>
                    <span className="indicator yellow"></span>
                    <span className="indicator green"></span>
                </div>
            </div>
            <nav className="gen5-nav">
                <ul>
                    <li>
                        <button className="tech-btn" onClick={() => navigate('/')}>
                            Pokedex
                        </button>
                    </li>
                    <li>
                        <button className="tech-btn" onClick={() => navigate('/team')}>
                            Mi Equipo
                        </button>
                    </li>
                    <li>
                        <button className="tech-btn" onClick={() => navigate('/map')}>
                            Mapa Regional
                        </button>
                    </li>
                </ul>
            </nav>
        </header>
    );
}

export default Header;