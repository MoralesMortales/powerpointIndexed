// Configura PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.worker.min.js';

let pdfDoc = null,
    pageNum = 1,
    pageRendering = false,
    pageNumPending = null,
    autoScrollInterval = null,
    scale = 1.5;

// Asegúrate de que el PDF esté en el mismo directorio o usa una URL válida
const url = 'https://drive.google.com/uc?export=download&id=1hBVAraj6J9XsJoFTQkj1nvtKZxkxn5y-';

// Elementos del DOM
const canvas = document.getElementById('pdf-viewer');
const ctx = canvas.getContext('2d');
const pageNumElement = document.getElementById('page-num');
const prevBtn = document.getElementById('prev-page');
const nextBtn = document.getElementById('next-page');
const autoScrollBtn = document.getElementById('auto-scroll');

// Cargar el PDF
pdfjsLib.getDocument(url).promise.then(function(pdf) {
    pdfDoc = pdf;
    renderPage(pageNum);
}).catch(error => {
    console.error('Error al cargar el PDF:', error);
    pageNumElement.textContent = 'Error al cargar el PDF';
});

// Renderizar una página
function renderPage(num) {
    pageRendering = true;
    pdfDoc.getPage(num).then(function(page) {
        const viewport = page.getViewport({ scale });
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
            canvasContext: ctx,
            viewport: viewport
        };

        page.render(renderContext).promise.then(function() {
            pageNumElement.textContent = `Página ${num} de ${pdfDoc.numPages}`;
            pageRendering = false;

            // Habilitar/deshabilitar botones según la página actual
            prevBtn.disabled = num <= 1;
            nextBtn.disabled = num >= pdfDoc.numPages;

            if (pageNumPending !== null) {
                renderPage(pageNumPending);
                pageNumPending = null;
            }
        });
    });
}

// Navegación entre páginas
function queueRenderPage(num) {
    if (pageRendering) {
        pageNumPending = num;
    } else {
        renderPage(num);
    }
}

// Botón Anterior
prevBtn.addEventListener('click', function() {
    if (pageNum <= 1) return;
    pageNum--;
    queueRenderPage(pageNum);
});

// Botón Siguiente
nextBtn.addEventListener('click', function() {
    if (pageNum >= pdfDoc.numPages) return;
    pageNum++;
    queueRenderPage(pageNum);
});

// Auto-Desplazamiento
autoScrollBtn.addEventListener('click', function() {
    if (autoScrollInterval) {
        clearInterval(autoScrollInterval);
        autoScrollInterval = null;
        autoScrollBtn.textContent = 'Auto-Desplazamiento';
        autoScrollBtn.style.backgroundColor = '#10b981';
    } else {
        autoScrollBtn.textContent = 'Detener';
        autoScrollBtn.style.backgroundColor = '#ef4444';
        autoScrollInterval = setInterval(function() {
            if (pageNum >= pdfDoc.numPages) {
                clearInterval(autoScrollInterval);
                autoScrollInterval = null;
                autoScrollBtn.textContent = 'Auto-Desplazamiento';
                autoScrollBtn.style.backgroundColor = '#10b981';
                return;
            }
            pageNum++;
            queueRenderPage(pageNum);
        }, 2000); // 2 segundos entre páginas
    }
});
