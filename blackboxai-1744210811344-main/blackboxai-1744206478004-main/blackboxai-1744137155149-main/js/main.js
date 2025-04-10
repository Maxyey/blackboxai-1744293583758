document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const searchInput = document.getElementById('searchInput');
    const sortFilter = document.getElementById('sortFilter');
    const tagSearchBtn = document.getElementById('tagSearchBtn');
    const viewToggle = document.getElementById('viewToggle');
    const songsList = document.getElementById('songsList');
    const adminBtn = document.getElementById('adminBtn');
    const adminModal = document.getElementById('adminModal');
    const adminLoginForm = document.getElementById('adminLoginForm');
    const closeAdminModal = document.getElementById('closeAdminModal');

    let isGridView = false; // Default to list view for better mobile compatibility
    let currentTags = [];

    // Set default theme if none exists
    if (!localStorage.getItem('theme')) {
        localStorage.setItem('theme', 'softSky');
        applyTheme('softSky');
    }

    // Initialize view
    updateViewMode();
    renderSongs();

    // Search and filter handlers
    searchInput.addEventListener('input', renderSongs);
    sortFilter.addEventListener('change', renderSongs);

    // View toggle (hide on mobile)
    if (window.innerWidth > 768) {
        viewToggle.style.display = 'block';
        viewToggle.addEventListener('click', () => {
            isGridView = !isGridView;
            localStorage.setItem('viewMode', isGridView ? 'grid' : 'list');
            updateViewMode();
            renderSongs();
        });
    } else {
        viewToggle.style.display = 'none';
    }

    // Admin login
    adminBtn.addEventListener('click', () => {
        if (adminModal) {
            adminModal.classList.remove('hidden');
        }
    });

    closeAdminModal.addEventListener('click', () => {
        adminModal.classList.add('hidden');
    });

    // Close modal when clicking outside
    adminModal.addEventListener('click', (e) => {
        if (e.target === adminModal || e.target.classList.contains('backdrop-blur-md')) {
            adminModal.classList.add('hidden');
        }
    });

    adminLoginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('adminEmail').value;
        const password = document.getElementById('adminPassword').value;

        if (email === 'maxyrocs01@gmail.com' && password === 'maxyrocs01@gmail.com') {
            localStorage.setItem('adminAuth', 'true');
            window.location.href = 'admin.html';
        } else {
            alert('Invalid credentials');
        }
    });

    // Tag search
    tagSearchBtn.addEventListener('click', () => {
        const allTags = storage.getAllTags();
        if (allTags.length === 0) {
            alert('No tags available');
            return;
        }

        const tagList = document.createElement('div');
        tagList.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50';
        tagList.innerHTML = `
            <div class="modal-content bg-white w-full sm:w-11/12 max-w-md">
                <div class="p-3 border-b">
                    <div class="flex justify-between items-center">
                        <h3 class="text-base font-semibold theme-text">Select Tags</h3>
                        <button class="p-1.5 rounded-full" id="closeTagModal">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
                <div class="p-3">
                    <div class="flex flex-wrap gap-2 mb-3">
                        ${allTags.map(tag => `
                            <button class="tag-btn px-2 py-1 rounded-full text-xs transition-all duration-300 ${
                                currentTags.includes(tag) ? 'theme-button' : 'bg-gray-100 theme-text'
                            }" data-tag="${tag}">
                                ${tag}
                            </button>
                        `).join('')}
                    </div>
                    <button id="applyTagFilters" class="w-full theme-button py-2 rounded-md text-sm">
                        Apply Filters
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(tagList);

        // Tag selection
        const tagButtons = tagList.querySelectorAll('.tag-btn');
        tagButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const tag = btn.dataset.tag;
                const isSelected = currentTags.includes(tag);
                
                if (isSelected) {
                    currentTags = currentTags.filter(t => t !== tag);
                    btn.classList.remove('theme-button');
                    btn.classList.add('bg-gray-100', 'theme-text');
                } else {
                    currentTags.push(tag);
                    btn.classList.add('theme-button');
                    btn.classList.remove('bg-gray-100', 'theme-text');
                }
            });
        });

        // Close modal
        const closeBtn = tagList.querySelector('#closeTagModal');
        closeBtn.addEventListener('click', () => {
            currentTags = [];
            tagList.remove();
            renderSongs();
        });

        // Apply filters
        document.getElementById('applyTagFilters').addEventListener('click', () => {
            if (currentTags.length > 0) {
                renderSongs();
            }
            tagList.remove();
        });
    });

    function updateViewMode() {
        viewToggle.innerHTML = isGridView ? 
            '<i class="fas fa-list"></i>' : 
            '<i class="fas fa-th-large"></i>';
        
        songsList.className = isGridView && window.innerWidth > 768 ?
            'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' :
            'space-y-2';
    }

    function renderSongs() {
        const query = searchInput.value;
        const sortBy = sortFilter.value;
        const songs = storage.searchSongs(query, sortBy, currentTags);

        songsList.innerHTML = '';

        if (songs.length === 0) {
            songsList.innerHTML = `
                <div class="text-center py-6">
                    <i class="fas fa-music text-3xl text-gray-400 mb-2"></i>
                    <p class="text-gray-500">No songs found</p>
                </div>
            `;
            return;
        }

        songs.forEach(song => {
            const songElement = document.createElement('div');
            songElement.className = 'song-card bg-white rounded-lg p-3 cursor-pointer flex gap-3 items-center shadow-sm hover:shadow md:p-4 md:gap-4';

            const audioData = storage.getAudioData(song.id);
            const hasAudio = audioData !== null;
            
            songElement.innerHTML = `
                <div class="flex-1 min-w-0">
                    <h3 class="font-semibold text-sm md:text-base mb-1 theme-text truncate">${song.name}</h3>
                    <p class="theme-text opacity-60 text-xs md:text-sm mb-1 truncate">${song.composer}</p>
                    <div class="flex flex-wrap gap-1">
                        ${song.tags.map(tag => `
                            <span class="text-xs px-2 py-0.5 bg-gray-50 rounded-full theme-text">${tag}</span>
                        `).join('')}
                    </div>
                </div>
                ${hasAudio ? `<i class="fas fa-${audioData.type === 'youtube' ? 'youtube' : 'music'} text-sm opacity-60" data-accent></i>` : ''}
            `;

            songElement.addEventListener('click', () => showSongDetails(song));
            songsList.appendChild(songElement);
        });
    }

    function showSongDetails(song) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50';
        
        const audioData = storage.getAudioData(song.id);
        let audioContent = '';

        if (audioData) {
            // Determine audio type and handle accordingly
            const url = audioData.data.toLowerCase();
            let audioType = audioData.type;

            // Auto-detect type and clean URL
            if (!audioType || audioType === 'url') {
                const cleanUrl = url.trim();
                if (cleanUrl.includes('youtube.com') || cleanUrl.includes('youtu.be')) {
                    audioType = 'youtube';
                } else if (cleanUrl.includes('drive.google.com')) {
                    audioType = 'gdrive';
                    // Ensure URL ends with /view for Google Drive
                    if (!cleanUrl.endsWith('/view')) {
                        url = cleanUrl + (cleanUrl.endsWith('/') ? 'view' : '/view');
                    }
                } else if (cleanUrl.includes('soundcloud.com')) {
                    audioType = 'soundcloud';
                } else {
                    audioType = 'file';
                }
            }

            // Handle different audio types
            switch (audioType) {
                case 'youtube': {
                    let videoId = '';
                    try {
                        if (url.includes('youtu.be/')) {
                            videoId = url.split('youtu.be/')[1].split(/[#?&]/)[0];
                        } else if (url.includes('youtube.com/watch')) {
                            const urlParams = new URLSearchParams(url.split('?')[1]);
                            videoId = urlParams.get('v');
                        } else if (url.includes('youtube.com/embed/')) {
                            videoId = url.split('embed/')[1].split(/[#?&]/)[0];
                        }
                        videoId = videoId?.trim();
                    } catch (e) {
                        console.error('Error parsing YouTube URL:', e);
                    }

                    audioContent = videoId && videoId.length === 11 ? `
                        <div class="aspect-video">
                            <iframe class="w-full h-full" 
                                src="https://www.youtube.com/embed/${videoId}" 
                                frameborder="0" 
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                allowfullscreen>
                            </iframe>
                        </div>
                    ` : '<p class="text-xs theme-text opacity-60 text-center">Invalid YouTube URL</p>';
                    break;
                }

                case 'gdrive': {
                    let fileId = '';
                    try {
                        if (url.includes('/file/d/')) {
                            fileId = url.split('/file/d/')[1].split(/[/?]/)[0];
                        } else if (url.includes('/d/')) {
                            fileId = url.split('/d/')[1].split(/[/?]/)[0];
                        } else if (url.includes('id=')) {
                            fileId = url.split('id=')[1].split(/[&?]/)[0];
                        }
                        fileId = fileId?.trim();
                    } catch (e) {
                        console.error('Error parsing Google Drive URL:', e);
                    }

                    audioContent = fileId ? `
                        <div class="flex items-center">
                            <iframe src="https://drive.google.com/file/d/${fileId}/preview" 
                                class="w-full h-16" 
                                allow="autoplay"
                                sandbox="allow-same-origin allow-scripts allow-forms">
                            </iframe>
                        </div>
                    ` : '<p class="text-xs theme-text opacity-60 text-center">Invalid Google Drive URL</p>';
                    break;
                }

                case 'soundcloud':
                    audioContent = `
                        <div class="flex items-center">
                            <iframe src="https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23ff5500&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false" 
                                class="w-full h-20" 
                                scrolling="no" 
                                frameborder="no" 
                                allow="autoplay">
                            </iframe>
                        </div>
                    `;
                    break;

                default: // Handle direct audio files
                    audioContent = `
                        <div class="flex items-center">
                            <audio controls class="w-full h-7">
                                <source src="${audioData.data}" type="audio/mpeg">
                                Your browser does not support the audio element.
                            </audio>
                        </div>
                    `;
            }
        }
        
        modal.innerHTML = `
            <div class="modal-content bg-white w-full h-[100vh] overflow-y-auto">
                <div class="sticky top-0 bg-white z-10 border-b">
                    <div class="flex justify-between items-center p-2">
                        <div class="min-w-0">
                            <h2 class="text-sm font-bold theme-text truncate">${song.name}</h2>
                            <p class="text-xs theme-text opacity-60 truncate">${song.composer}</p>
                        </div>
                        <button class="p-1" id="closeSongModal">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="p-4 bg-gray-50 border-b">
                        <p class="text-base font-semibold theme-text mb-3 flex items-center gap-2">
                            <i class="fas fa-music text-sm opacity-70"></i>
                            <span>${song.demoText || 'Demo Version'}</span>
                        </p>
                        ${audioData ? `
                            ${audioContent}
                        ` : `
                            <p class="text-xs theme-text opacity-60 text-center">No audio available</p>
                        `}
                        <div class="mt-4 pb-3 flex flex-col">
                            <h3 class="text-xl font-bold theme-text tracking-wide text-center mb-1">${song.title || song.name}</h3>
                            <p class="text-xs theme-text opacity-60 italic text-right pr-1">by ${song.composer || song.author}</p>
                        </div>
                    </div>
                </div>
                <div class="p-6 flex flex-col min-h-[300px]">
                    <div class="flex-grow flex items-center justify-center">
                        <pre class="whitespace-pre-wrap font-sans text-sm leading-6 theme-text text-center max-w-lg mx-auto">${song.lyrics}</pre>
                    </div>
                    <div class="flex flex-wrap gap-2 text-xs theme-text opacity-60 justify-center mt-8 pt-4 border-t">
                        ${song.tags.map(tag => `#${tag}`).join(' ')}
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Close modal
        document.getElementById('closeSongModal').addEventListener('click', () => {
            modal.remove();
        });

        // Close on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }
});
