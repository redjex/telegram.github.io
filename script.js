document.addEventListener('DOMContentLoaded', () => {
    const originalApps = [
        { id: 1, name: 'Банер из сторисов', time: '#Фото', description: 'Редактирование вашего профиля', status: 'profile', page: 'menu.html' }
    ];
    
    const apps = originalApps; 

    let currentFilter = 'profile';
    const appsList = document.getElementById('appsList');
    const bottomSheet = document.getElementById('bottomSheet');
    const overlay = document.getElementById('overlay');
    const sheetHeader = document.getElementById('sheetHeader');
    const filterBar = document.getElementById('filterBar');
    const searchInput = document.getElementById('searchInput');
    const container = document.querySelector('.container');
    const stickyHeader = document.querySelector('.sticky-header');
    
    const menuTrigger = document.getElementById('menuTrigger');
    const popupMenu = document.getElementById('popupMenu');
    const colorPaletteItems = document.querySelectorAll('.color-palette-item');
    
    const body = document.body;
    const STORAGE_KEY = 'twitchAppTheme';
    const searchIcon = document.getElementById('searchIcon');
    const settingsIcon = document.getElementById('settingsIcon');


    let startY = 0;
    let currentY = 0;
    let isDraggingSheet = false;
    let currentSelected = null;
    let isDraggingFilter = false; 
    let startX = 0;
    let scrollLeft = 0;


    function createAppComponent(app) {
        const appItem = document.createElement('div');
        appItem.className = 'app-item';
        appItem.setAttribute('data-status', app.status); 
        
        appItem.innerHTML = `
            <div class="app-info">
                <h3>${app.name}</h3>
                <p>${app.time}</p>
            </div>
        `;
        
        appItem.addEventListener('click', () => {
            if (app.page) {
                window.location.href = `menu/${app.page}`;
            }
        }); 
        return appItem;
    }

    function renderApps() {
        appsList.innerHTML = '';
        apps.forEach(app => {
            appsList.appendChild(createAppComponent(app));
        });
        filterApps();
    }
    
    function cleanupBottomSheetClasses() {
        container.classList.remove('blur-active');
        document.getElementById('timerButton').classList.remove('unavailable');
        stickyHeader.classList.remove('blur-active'); 

        bottomSheet.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';

        if (currentSelected) {
            currentSelected.classList.remove('selected');
            currentSelected = null;
        }
        
        bottomSheet.removeEventListener('transitionend', cleanupBottomSheetClasses);
    }
    
    function closeBottomSheet() {
        bottomSheet.style.transition = 'transform 0.3s ease-out';
        
        bottomSheet.style.transform = 'translateY(100%)'; 
        
        bottomSheet.addEventListener('transitionend', cleanupBottomSheetClasses);
    }
    
    function filterApps() {
        const searchText = searchInput.value.toLowerCase();
        const appItems = document.querySelectorAll('.app-item');
        
        appItems.forEach(item => {
            const status = item.getAttribute('data-status');
            const name = item.querySelector('.app-info h3').textContent.toLowerCase();
            
            const matchesStatus = (currentFilter === 'all' || status === currentFilter);
            const matchesSearch = name.includes(searchText);
            
            item.style.display = (matchesStatus && matchesSearch) ? 'flex' : 'none';
        });
    }

    function setupFilterListeners() {
        document.querySelectorAll('.filter-button').forEach(button => {
            button.addEventListener('click', (e) => {
                currentFilter = e.currentTarget.getAttribute('data-filter'); 
                document.querySelectorAll('.filter-button').forEach(btn => btn.classList.remove('active'));
                e.currentTarget.classList.add('active');
                filterApps();
            });
        });
        searchInput.addEventListener('input', filterApps);
    }
    
    function setActiveFilterOnLoad() {
        const defaultButton = document.querySelector(`.filter-button[data-filter="${currentFilter}"]`);
        if (defaultButton) {
            defaultButton.classList.add('active');
        }
    }

    
    filterBar.addEventListener('mousedown', (e) => {
        isDraggingFilter = false; 
        startX = e.pageX - filterBar.offsetLeft;
        scrollLeft = filterBar.scrollLeft;
        e.preventDefault(); 
        
        document.addEventListener('mousemove', handleFilterMouseMove);
        document.addEventListener('mouseup', handleFilterMouseUp);
    });
    
    filterBar.addEventListener('touchstart', (e) => {
        isDraggingFilter = false; 
        startX = e.touches[0].pageX - filterBar.offsetLeft;
        scrollLeft = filterBar.scrollLeft;
        
        document.addEventListener('touchmove', handleFilterTouchMove, { passive: false });
        document.addEventListener('touchend', handleFilterTouchEnd);
    }, { passive: true });

    function handleFilterMouseMove(e) {
        if (!isDraggingFilter && Math.abs(e.pageX - (startX + filterBar.offsetLeft)) > 5) {
            isDraggingFilter = true;
            filterBar.classList.add('dragging');
        }
        
        if (!isDraggingFilter) return;
        
        const x = e.pageX - filterBar.offsetLeft;
        const walk = (x - startX) * 1.5; 
        filterBar.scrollLeft = scrollLeft - walk;
    }

    function handleFilterMouseUp() {
        filterBar.classList.remove('dragging');
        
        setTimeout(() => {
            isDraggingFilter = false;
        }, 50);

        document.removeEventListener('mousemove', handleFilterMouseMove);
        document.removeEventListener('mouseup', handleFilterMouseUp);
    }
    
    function handleFilterTouchMove(e) {
        if (!isDraggingFilter && Math.abs(e.touches[0].pageX - (startX + filterBar.offsetLeft)) > 5) {
            isDraggingFilter = true;
            filterBar.classList.add('dragging');
        }
        
        if (!isDraggingFilter) return;

        const x = e.touches[0].pageX - filterBar.offsetLeft;
        const walk = (x - startX) * 1.5; 
        filterBar.scrollLeft = scrollLeft - walk;
    }

    function handleFilterTouchEnd() {
        filterBar.classList.remove('dragging');
        
        setTimeout(() => {
            isDraggingFilter = false;
        }, 50);

        document.removeEventListener('touchmove', handleFilterTouchMove);
        document.removeEventListener('touchend', handleFilterTouchEnd);
    }


    
    overlay.addEventListener('click', closeBottomSheet);
    sheetHeader.addEventListener('touchstart', handleTouchStart, { passive: false });
    sheetHeader.addEventListener('touchmove', handleTouchMove, { passive: false });
    sheetHeader.addEventListener('touchend', handleTouchEnd);
    sheetHeader.addEventListener('mousedown', handleMouseDown);

    function handleMouseDown(e) {
        e.preventDefault();
        isDraggingSheet = true;
        startY = e.clientY;
        bottomSheet.style.transition = 'none'; 
        
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }

    function handleMouseMove(e) {
        if (!isDraggingSheet) return;
        
        e.preventDefault();
        currentY = e.clientY;
        const deltaY = currentY - startY;
        
        if (deltaY > 0) {
            bottomSheet.style.transform = `translateY(${deltaY}px)`; 
        }
    }

    function handleMouseUp(e) {
        if (!isDraggingSheet) return;
        
        isDraggingSheet = false;
        bottomSheet.style.transition = 'transform 0.3s ease-out'; 
        
        const deltaY = currentY - startY;
        const sheetHeight = bottomSheet.offsetHeight;
        const threshold = sheetHeight * 0.3; 
        
        if (deltaY > threshold) {
            bottomSheet.style.transform = 'translateY(100%)'; 
            bottomSheet.addEventListener('transitionend', cleanupBottomSheetClasses, { once: true });
        } else {
            bottomSheet.style.transform = 'translateY(0)'; 
        }
        
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    }

    function handleTouchStart(e) {
        isDraggingSheet = true;
        startY = e.touches[0].clientY;
        bottomSheet.style.transition = 'none'; 
    }

    function handleTouchMove(e) {
        if (!isDraggingSheet) return;
        
        e.preventDefault();
        currentY = e.touches[0].clientY;
        const deltaY = currentY - startY;
        
        if (deltaY > 0) {
            bottomSheet.style.transform = `translateY(${deltaY}px)`; 
        }
    }

    function handleTouchEnd(e) {
        if (!isDraggingSheet) return;
        
        isDraggingSheet = false;
        bottomSheet.style.transition = 'transform 0.3s ease-out';
        
        const deltaY = currentY - startY; 
        const sheetHeight = bottomSheet.offsetHeight;
        const threshold = sheetHeight * 0.3;
        
        if (deltaY > threshold) {
            bottomSheet.style.transform = 'translateY(100%)'; 
            bottomSheet.addEventListener('transitionend', cleanupBottomSheetClasses, { once: true });
        } else {
            bottomSheet.style.transform = 'translateY(0)'; 
        }
    }
    
    menuTrigger.addEventListener('click', toggleMenu);

    document.addEventListener('click', (e) => {
        if (popupMenu.classList.contains('active') && !popupMenu.contains(e.target) && !menuTrigger.contains(e.target)) {
            closeMenu();
        }
    });

    function toggleMenu() {
        if (popupMenu.classList.contains('active')) {
            closeMenu();
        } else {
            openMenu();
        }
    }

    function openMenu() {
        popupMenu.classList.add('active');
        menuTrigger.classList.add('active');
    }

    function closeMenu() {
        popupMenu.classList.remove('active');
        menuTrigger.classList.remove('active');
    }

    function setTheme(theme) {
        body.classList.remove('theme-grey', 'theme-white', 'theme-black');
        body.classList.add(`theme-${theme}`);

        if (theme === 'white') {
            searchIcon.src = 'img/search_n.png';
            settingsIcon.src = 'img/icon/Moon.svg';
        } else {
            searchIcon.src = 'img/search.png';
            settingsIcon.src = 'img/icon/Sun.svg';
        }
        
        colorPaletteItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-color') === theme) {
                item.classList.add('active');
            }
        });
        
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ theme: theme }));
        } catch (error) {
            console.error("Ошибка при сохранении темы в localStorage", error);
        }
    }
    
    function loadTheme() {
        try {
            const savedThemeData = localStorage.getItem(STORAGE_KEY);
            if (savedThemeData) {
                const data = JSON.parse(savedThemeData);
                const theme = data.theme;
                if (['grey', 'white', 'black'].includes(theme)) {
                    setTheme(theme);
                    return;
                }
            }
        } catch (error) {
            console.error("Ошибка при загрузке темы из localStorage", error);
        }
        
        setTheme('grey');
    }
    
    colorPaletteItems.forEach(button => {
        button.addEventListener('click', (e) => {
            const color = e.currentTarget.getAttribute('data-color');
            setTheme(color);
            closeMenu();
        });
    });


    loadTheme();
    setActiveFilterOnLoad(); 
    renderApps();           
    setupFilterListeners();
});