import React from 'react';

interface LogoProps {
    className?: string;
    style?: React.CSSProperties;
}

const Logo: React.FC<LogoProps> = ({ className = '', style = {} }) => {
    return (
        <img
            src="/images/venincorse.png"
            alt="VéninCorsé"
            className={`block object-contain ${className || 'h-8 w-auto sm:h-9 lg:h-10'}`}
            style={style}
        />
    );
};

export default Logo;
