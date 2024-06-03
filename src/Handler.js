import React, { useState } from 'react';

const Handler = () => {
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [timestamps, setTimestamps] = useState('');
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = {
            youtubeUrl: youtubeUrl,
            timestamps: timestamps
        }

        try {
            const response = await fetch('http://localhost:5000/process', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const result = await response.json();
            setResult(result);
            setError(null);
        } catch (error) {
            console.error('Failed to fetch:', error);
            setError(error.message);
        }
    };

    return (
        <div>
            <h1>Convert YouTube Video to Spotify Tracks</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="youtubeUrl">YouTube Video URL:</label>
                    <input 
                        type="text" 
                        id="youtubeUrl" 
                        value={youtubeUrl} 
                        onChange={(e) => setYoutubeUrl(e.target.value)} 
                        required 
                    />
                </div>
                <div>
                    <label htmlFor="timestamps">Timestamps and Song Titles (format: hh:mm:ss - Title):</label>
                    <textarea 
                        id="timestamps" 
                        value={timestamps} 
                        onChange={(e) => setTimestamps(e.target.value)} 
                        rows="10" 
                        cols="50" 
                        required 
                    />
                </div>
                <button type="submit">Convert</button>
            </form>
        </div>
    );
};

export default Handler;
