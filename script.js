   pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.worker.min.js';

      let pdfDoc = null,
          pageNum = 1,
          pageRendering = false,
          pageNumPending = null,
          autoScrollInterval = null;

      const url = 'https://raw.githubusercontent.com/MoralesMortales/powerpointIndexed/master/testPowerpoint.pdf';

      const canvas = document.getElementById('pdf-viewer');
      const ctx = canvas.getContext('2d');
      const paginationControls = document.getElementById('pdf-pagination-controls');

      pdfjsLib.getDocument(url).promise.then(function(pdf) {
        pdfDoc = pdf;
        createPageButtons(pdfDoc.numPages);
        renderPage(pageNum);
        startAutoScroll();
      }).catch(error => {
        console.error('Error uploading PDF:', error);
      });     function createPageButtons(totalPages) {
        paginationControls.innerHTML = '';
        
        for (let i = 1; i <= totalPages; i++) {
          const button = document.createElement('button');
          button.textContent = i;
          button.dataset.page = i;
          
          button.addEventListener('click', function() {
            goToPage(parseInt(this.dataset.page));
          });
          
          paginationControls.appendChild(button);
        }
        updateActiveButton();
      }

      function updateActiveButton() {
        const buttons = paginationControls.querySelectorAll('button');
        buttons.forEach(button => {
          button.style.backgroundColor = parseInt(button.dataset.page) === pageNum 
            ? '#10b981' 
            : 'rgba(59, 130, 246, 0.8)';
        });
      }

      function renderPage(num) {
        pageRendering = true;
        pdfDoc.getPage(num).then(function(page) {
          const viewport = page.getViewport({ scale: 1.0 });
          const container = document.getElementById('pdf-viewer-container');
          
          const scale = Math.min(
            container.clientWidth / viewport.width,
            (container.clientHeight - 40) / viewport.height // Deja espacio para controles
          );
          
          const scaledViewport = page.getViewport({ scale });
          
          canvas.height = scaledViewport.height;
          canvas.width = scaledViewport.width;

          const renderContext = {
            canvasContext: ctx,
            viewport: scaledViewport
          };

          page.render(renderContext).promise.then(function() {
            pageRendering = false;
            updateActiveButton();
            
            if (pageNumPending !== null) {
              renderPage(pageNumPending);
              pageNumPending = null;
            }
          });
        });
      }      function queueRenderPage(num) {
        if (pageRendering) {
          pageNumPending = num;
        } else {
          renderPage(num);
        }
      }

      function goToPage(num) {
        if (num < 1 || num > pdfDoc.numPages) return;
        pageNum = num;
        queueRenderPage(pageNum);
        
        // Reiniciar el auto scroll al cambiar manualmente
        resetAutoScroll();
      }

      function startAutoScroll() {
        if (autoScrollInterval) clearInterval(autoScrollInterval);
        
        autoScrollInterval = setInterval(function() {
          let nextPage = pageNum + 1;
          if (nextPage > pdfDoc.numPages) {
            nextPage = 1; // Volver al inicio si llegamos al final
          }
          goToPage(nextPage);
        }, 4000); // 4 segundos
      }

      function resetAutoScroll() {
        if (autoScrollInterval) clearInterval(autoScrollInterval);
        startAutoScroll();
      }

      // Ajustar el tamaño cuando cambia la ventana
      window.addEventListener('resize', function() {
        if (pdfDoc) {
          queueRenderPage(pageNum);
        }
      });


      document.getElementById('download-btn').addEventListener('click', function() {
        const link = document.createElement('a');
        link.href = url;
        link.download = 'presentacion-carlos-morales.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });

      window.addEventListener('resize', function() {
        if (pdfDoc) {
          queueRenderPage(pageNum);
        }
      });
