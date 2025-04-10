class StorageManager {
    constructor() {
        // Initialize storage
        this.songs = JSON.parse(localStorage.getItem('songs')) || [];
        this.audioData = JSON.parse(localStorage.getItem('audioData')) || {};

        // Initialize with sample data if no songs exist
        if (this.songs.length === 0) {
            const sampleSongs = [
                {
                    id: '1',
                    name: 'Amazing Grace',
                    composer: 'John Newton',
                    lyrics: 'Amazing grace, how sweet the sound\nThat saved a wretch like me.\nI once was lost, but now am found,\nWas blind, but now I see.',
                    tags: ['hymn', 'classic', 'worship'],
                    demoText: 'Demo song'
                },
                {
                    id: '2',
                    name: 'How Great Thou Art',
                    composer: 'Carl Boberg',
                    lyrics: 'O Lord my God, when I in awesome wonder\nConsider all the worlds Thy hands have made,\nI see the stars, I hear the rolling thunder,\nThy power throughout the universe displayed.',
                    tags: ['hymn', 'worship', 'traditional'],
                    demoText: 'Demo song'
                },
                {
                    id: '3',
                    name: 'It Is Well',
                    composer: 'Horatio Spafford',
                    lyrics: 'When peace like a river attendeth my way,\nWhen sorrows like sea billows roll,\nWhatever my lot, Thou hast taught me to say,\nIt is well, it is well with my soul.',
                    tags: ['hymn', 'peace', 'classic'],
                    demoText: 'Demo song'
                }
            ];
            this.songs = sampleSongs;

            // Add sample audio data
            this.audioData = {
                '1': { // Amazing Grace
                    type: 'youtube',
                    data: 'https://www.youtube.com/watch?v=X6Mtpk4jeVA'
                },
                '2': { // How Great Thou Art
                    type: 'youtube',
                    data: 'https://www.youtube.com/watch?v=dBLjjeP0PbM'
                },
                '3': { // It Is Well
                    type: 'gdrive',
                    data: 'https://drive.google.com/file/d/1234567890abcdef/view'
                }
            };
            this.saveSongs();
        }
    }

    // Save songs to localStorage
    saveSongs() {
        localStorage.setItem('songs', JSON.stringify(this.songs));
        localStorage.setItem('audioData', JSON.stringify(this.audioData));
    }

    // Add new song
    addSong(song, audioData = null, audioUrl = null) {
        song.id = Date.now().toString();
        song.tags = typeof song.tags === 'string' ? 
            song.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : 
            song.tags;
        song.demoText = song.demoText || 'Demo song';
        
        if (audioData) {
            this.audioData[song.id] = { type: 'file', data: audioData };
        } else if (audioUrl) {
            this.audioData[song.id] = { 
                type: this.isYouTubeUrl(audioUrl) ? 'youtube' : 'url',
                data: audioUrl 
            };
        }
        
        this.songs.push(song);
        this.saveSongs();
        return song;
    }

    // Get all songs
    getAllSongs() {
        return this.songs;
    }

    // Get song by ID
    getSong(id) {
        const song = this.songs.find(song => song.id === id);
        if (song) {
            song.audioData = this.audioData[id] || null;
        }
        return song;
    }

    // Update song
    updateSong(id, updatedSong, audioData = null, audioUrl = null) {
        const index = this.songs.findIndex(song => song.id === id);
        if (index !== -1) {
            // Keep existing song data that shouldn't be overwritten
            const existingSong = this.songs[index];
            
            // Ensure tags are in array format
            const tags = typeof updatedSong.tags === 'string' ? 
                updatedSong.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : 
                updatedSong.tags;

            // Update audio data if provided
            if (audioData) {
                this.audioData[id] = { type: 'file', data: audioData };
            } else if (audioUrl) {
                this.audioData[id] = { 
                    type: this.isYouTubeUrl(audioUrl) ? 'youtube' : 'url',
                    data: audioUrl 
                };
            }

            // Update the song with new data while preserving the ID
            this.songs[index] = {
                ...existingSong,
                ...updatedSong,
                id: existingSong.id,
                tags: tags,
                demoText: updatedSong.demoText || existingSong.demoText || 'Demo song'
            };
            
            this.saveSongs();
            return true;
        }
        return false;
    }

    // Delete song
    deleteSong(id) {
        const index = this.songs.findIndex(song => song.id === id);
        if (index !== -1) {
            this.songs.splice(index, 1);
            delete this.audioData[id];
            this.saveSongs();
            return true;
        }
        return false;
    }

    // Search songs
    searchSongs(query, sortBy = 'az', tags = []) {
        let filteredSongs = [...this.songs];

        // Search by query
        if (query) {
            const searchQuery = query.toLowerCase();
            filteredSongs = filteredSongs.filter(song => 
                song.name.toLowerCase().includes(searchQuery) ||
                song.composer.toLowerCase().includes(searchQuery) ||
                song.lyrics.toLowerCase().includes(searchQuery) ||
                song.tags.some(tag => tag.toLowerCase().includes(searchQuery))
            );
        }

        // Filter by tags
        if (tags.length > 0) {
            filteredSongs = filteredSongs.filter(song => 
                tags.some(searchTag => 
                    song.tags.some(songTag => 
                        songTag.toLowerCase().includes(searchTag.toLowerCase())
                    )
                )
            );
        }

        // Sort results
        switch (sortBy) {
            case 'za':
                filteredSongs.sort((a, b) => b.name.localeCompare(a.name));
                break;
            case 'az':
            default:
                filteredSongs.sort((a, b) => a.name.localeCompare(b.name));
        }

        return filteredSongs;
    }

    // Get all unique tags
    getAllTags() {
        const tagSet = new Set();
        this.songs.forEach(song => {
            song.tags.forEach(tag => tagSet.add(tag));
        });
        return Array.from(tagSet).sort();
    }

    // Handle audio data
    getAudioData(songId) {
        return this.audioData[songId] || null;
    }

    // Update audio data
    updateAudioData(songId, audioData = null, audioUrl = null) {
        if (audioData) {
            this.audioData[songId] = { type: 'file', data: audioData };
        } else if (audioUrl) {
            this.audioData[songId] = { 
                type: this.isYouTubeUrl(audioUrl) ? 'youtube' : 'url',
                data: audioUrl 
            };
        }
        this.saveSongs();
    }

    // Helper function to check if URL is a YouTube URL
    isYouTubeUrl(url) {
        return url.match(/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/);
    }

    // Helper function to extract YouTube video ID
    getYouTubeVideoId(url) {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    }
}

// Create a single instance of StorageManager
const storage = new StorageManager();
