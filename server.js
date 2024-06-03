const express = require('express');
const bodyParser = require('body-parser');

const youtubedl = require('youtube-dl-exec');
const ffmpeg = require('fluent-ffmpeg');
const app = express();
const port = 5000;

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.use(bodyParser.json());
app.post('/process', (req, res) => {
    const { youtubeUrl, timestamps } = req.body;

    youtubedl(youtubeUrl, {
        output: 'video.mp4',
        format: 'bestaudio'
    }).then(() => {
        const timestampEntries = parseTimestamps(timestamps);
        timestampEntries.forEach(entry => {
            ffmpeg('video.mp4')
                .setStartTime(entry.startTime)
                .setDuration(entry.duration)
                .output(`${entry.title}.mp3`)
                .on('end', () => {
                    console.log(`${entry.title}.mp3 created`);
                })
                .on('error', (err) => {
                    console.log('Error: ' + err.message);
                })
                .run();
        });

        res.json({ status: 'Processing started' });
    }).catch(err => {
        res.status(500).json({ error: 'Error downloading video', details: err });
    });
});

const parseTimestamps = (timestamps) => {
    const entries = [];
    const lines = timestamps.split('\n');
    lines.forEach(line => {
        const [time, title] = line.split(' - ');
        const [start, end] = time.split(' ');
        const duration = calculateDuration(start, end);

        entries.push({ startTime: start, duration, title });
    });
    return entries;
};

const calculateDuration = (start, end) => {
    const startParts = start.split(':').map(Number);
    const endParts = end.split(':').map(Number);

    const startSeconds = startParts[0] * 3600 + startParts[1] * 60 + startParts[2];
    const endSeconds = endParts[0] * 3600 + endParts[1] * 60 + endParts[2];

    return endSeconds - startSeconds;
};

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
