import React from 'react';

/**
 * Componente de Barra de Experiência e Nível.
 *
 * @param {object} props
 * @param {number} props.currentLevel - Nível atual do usuário (ex: 5).
 * @param {number} props.currentXp - Experiência atual acumulada no nível (ex: 300).
 * @param {number} props.xpToNextLevel - Total de experiência necessária para o próximo nível (ex: 1000).
 */
const ExperienceBar = ({ currentLevel, currentXp, xpToNextLevel }) => {
    // Calcula a porcentagem de preenchimento da barra
    const progressPercentage = (currentXp / xpToNextLevel) * 100;

    // Estilos básicos para a barra (fáceis de customizar)
    const containerStyle = {
        width: '100%',
        fontFamily: 'Arial, sans-serif',
        margin: '20px 0',
    };

    const levelInfoStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '8px',
    };

    const levelTextStyle = {
        fontWeight: 'bold',
        fontSize: '1.2rem',
        color: 'var(--text-primary)',
    };

    const barContainerStyle = {
        width: '100%',
        height: '10px',
        backgroundColor: 'var(--bg-input)',
        borderRadius: '5px',
        position: 'relative',
    };

    const barFillStyle = {
        height: '100%',
        width: `${progressPercentage}%`,
        backgroundColor: '#007bff', // Cor de progresso (azul)
        borderRadius: '5px',
        transition: 'width 0.5s ease-in-out',
    };

    const xpInfoStyle = {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: '8px',
        fontSize: '0.9rem',
        fontWeight: 'bold',
        gap: '8px',
    };

    const currentXpStyle = {
        color: '#007bff',
    };

    const nextXpStyle = {
        color: 'var(--text-secondary)',
    };

    return (
        <div style={containerStyle}>
            {/* Informações de Nível */}
            <div style={levelInfoStyle}>
                <span style={levelTextStyle}>Lv {currentLevel}</span>
                <span style={levelTextStyle}>Lv {currentLevel + 1}</span>
            </div>

            {/* Barra de Progresso */}
            <div style={barContainerStyle}>
                <div style={barFillStyle} />
            </div>

            {/* Valores de XP embaixo */}
            <div style={xpInfoStyle}>
                <span style={currentXpStyle}>{currentXp} XP</span>
                <span style={nextXpStyle}>/ {xpToNextLevel} XP</span>
            </div>
        </div>
    );
};

export default ExperienceBar;