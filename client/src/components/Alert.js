import React from 'react'

export default function Alert({ className, message, onCloseClick }) {
    return (
        <div className={`alert-box ${className}`}>
            <button className="close" onClick={onCloseClick}>&times;</button>
            <div className="alert-message">
                {message}
            </div>
        </div>
    )

}