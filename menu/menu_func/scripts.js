document.fonts.ready.then(() => {
    console.log('Fonts loaded successfully');
});

let selectedMode = '1x3';
let uploadedImage = null;
let allCanvases = [];

const FINAL_WIDTH = 1080;
const FINAL_HEIGHT = 1920;
const IMAGE_HEIGHT = 1350;
const FRAME_HEIGHT = 285;

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
let isProcessing = false;
const resetBtn = document.getElementById('resetBtn');

document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedMode = btn.dataset.mode;
        document.getElementById('preview').style.display = 'none'; 
        document.body.classList.remove('has-results');
        document.querySelector('.container').classList.remove('expanded');
    });
});

const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const processBtn = document.getElementById('processBtn');

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        loadImage(e.target.files[0]);
    }
});

uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    if (e.dataTransfer.files.length > 0) {
        loadImage(e.dataTransfer.files[0]);
    }
});

function loadImage(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            uploadedImage = img;
            processBtn.disabled = false;
            processBtn.innerText = "Обработать";
            uploadArea.querySelector('.upload-text').innerText = `Файл: ${file.name}`;
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

async function downloadAll() {
    if (allCanvases.length === 0) return;
    processBtn.disabled = true;
    const originalText = processBtn.innerText;

    for (let i = 0; i < allCanvases.length; i++) {
        processBtn.innerText = `Сохранение: ${i + 1}/${allCanvases.length}`;
        
        const canvas = allCanvases[i];
        const filename = `photo_${i + 1}.jpg`;
        
        downloadCanvas(canvas, filename);
        await delay(300); 
    }

    processBtn.innerText = "Готово!";
    await delay(1000);
    processBtn.innerText = originalText;
    processBtn.disabled = false;
}

function downloadCanvas(canvas, filename) {
    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL('image/jpeg', 0.95);
    link.click();
}

processBtn.addEventListener('click', async () => {
    if (processBtn.innerText.includes("Скачать")) {
        downloadAll();
        return;
    }

    if (!uploadedImage || isProcessing) return;

    isProcessing = true;
    allCanvases = [];
    processBtn.disabled = true;

    const [rows, cols] = selectedMode.split('x').map(Number);
    const totalSteps = rows * cols;
    
    const totalWidth = cols * FINAL_WIDTH;
    const totalImageHeight = rows * IMAGE_HEIGHT;

    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = totalWidth;
    tempCanvas.height = totalImageHeight;
    tempCtx.drawImage(uploadedImage, 0, 0, totalWidth, totalImageHeight);

    for (let i = 0; i < totalSteps; i++) {
        let progress = Math.round((i / totalSteps) * 100);
        processBtn.innerText = `Готово: ${progress}%`;
        
        await delay(100);

        const row = Math.floor(i / cols);
        const col = i % cols;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = FINAL_WIDTH;
        canvas.height = FINAL_HEIGHT;

        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, FINAL_WIDTH, FINAL_HEIGHT);

        ctx.drawImage(
            tempCanvas,
            col * FINAL_WIDTH, row * IMAGE_HEIGHT, FINAL_WIDTH, IMAGE_HEIGHT,
            0, FRAME_HEIGHT, FINAL_WIDTH, IMAGE_HEIGHT
        );

        ctx.fillStyle = '#000000';
        ctx.font = 'bold 48px "Special Gothic Expanded One", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('@redjex', FINAL_WIDTH / 2, FRAME_HEIGHT / 2);
        ctx.fillText('@redjex', FINAL_WIDTH / 2, FRAME_HEIGHT + IMAGE_HEIGHT + FRAME_HEIGHT / 2);

        allCanvases.push(canvas);
    }

    processBtn.innerText = "Скачать результат";
    processBtn.disabled = false;
    isProcessing = false;
    const resetBtn = document.getElementById('resetBtn');
    resetBtn.style.display = 'block';
});

resetBtn.addEventListener('click', () => {
    document.querySelector('.actions-container').classList.remove('finished');
    fileInput.value = "";
    uploadedImage = null;
    allCanvases = [];
    processBtn.innerText = "Обработать";
    processBtn.disabled = true;
    processBtn.onclick = null;
    
    uploadArea.querySelector('.upload-text').innerText = "Нажмите или перетащите изображение сюда";
});

document.getElementById('downloadAllBtn').addEventListener('click', downloadAll);

function downloadCanvas(canvas, filename) {
    canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }, 'image/jpeg', 0.95);
}

document.addEventListener('DOMContentLoaded', () => {
    const STORAGE_KEY = 'twitchAppTheme';

    function applySavedTheme() {
        try {
            const savedThemeData = localStorage.getItem(STORAGE_KEY);
            if (savedThemeData) {
                const { theme } = JSON.parse(savedThemeData);
                document.body.classList.remove('theme-grey', 'theme-white', 'theme-black');
                document.body.classList.add(`theme-${theme}`);
            } else {
                document.body.classList.add('theme-grey');
            }
        } catch (e) {
            console.error("Ошибка загрузки темы", e);
        }
    }

    applySavedTheme();

    const backBtn = document.querySelector('.exit');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.location.href = '../index.html';
        });
    }
});

document.getElementById('resetBtn').addEventListener('click', () => {
    fileInput.value = "";
    uploadedImage = null;
    allCanvases = [];
    processBtn.innerText = "Обработать";
    processBtn.disabled = true;
    document.getElementById('resetBtn').style.display = 'none';
    uploadArea.querySelector('.upload-text').innerText = "Нажмите или перетащите изображение сюда";
});