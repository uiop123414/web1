let originalImageData; // сохраняем оригинальное изображение

document.getElementById('image-input').addEventListener('change', handleImage);
// document.getElementById('apply-tone').addEventListener('click', applyTone);

function handleImage(event) {


    const input = event.target;
    const canvas = document.getElementById('image-canvas');
    const widthValue = document.getElementById('width-value');
    const heightValue = document.getElementById('height-value');
    const colorValues = document.getElementById('color-values');
    const pixelCoordinates = document.getElementById('pixel-coordinates');

    const img = new Image();
    img.onload = function() {
        canvas.width = img.width;
        canvas.height = img.height;
        widthValue.textContent = img.width;
        heightValue.textContent = img.height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, img.width, img.height);
        originalImageData = ctx.getImageData(0, 0, img.width, img.height);

        document.getElementById('initial-pixel-info-text').textContent = img.width * img.height;


        canvas.addEventListener('mousemove', function(e) {
            const x = e.offsetX;
            const y = e.offsetY;
            const pixel = ctx.getImageData(x, y, 1, 1).data;

            const rgba = `${pixel[0]}, ${pixel[1]}, ${pixel[2]}`;
            colorValues.textContent = rgba;

            const coordinates = `x=${x}, y=${y}`;
            pixelCoordinates.textContent = coordinates;
        });
    
    };

    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function applyTone() {
    const canvas = document.getElementById('image-canvas');
    const ctx = canvas.getContext('2d');
    const toneInput = document.getElementById('tone-input');
    const toneValue = document.getElementById('tone-value');
    const downloadLink = document.getElementById('download-link');

    ctx.putImageData(originalImageData, 0, 0); // восстанавливаем оригинальное изображение

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const toneAmount = parseInt(toneInput.value);
    toneValue.textContent = toneAmount;

    for (let i = 0; i < imgData.data.length; i += 4) {
        imgData.data[i] += toneAmount; // Red
        imgData.data[i + 1] += toneAmount; // Green
        imgData.data[i + 2] += toneAmount; // Blue
    }

    ctx.putImageData(imgData, 0, 0);

    // Enable download link
    const dataURL = canvas.toDataURL();
    downloadLink.href = dataURL;
    downloadLink.download = 'image_with_tone.png';
    downloadLink.style.display = 'block';
}


$(document).ready(function() {
    // Обработчик кнопки "Изменить размер"
    $("#resize-image-button").click(function() {
      // Получение данных из формы
      var width = parseInt($("#resize-width").val());
      var height = parseInt($("#resize-height").val());

      type = $("#resize-method").val();
  
      // Проверка валидности введенных данных
      if (isNaN(width) || isNaN(height) || width <= 0 || height <= 0) {
        $("#error-message").text("Введите корректные значения ширины и высоты.").show();
        return;
      }
      if(type=="percent"){
        width = canvas.width * (width/100)
        height = canvas.height * (height/100)
      }
      
      canvas.width = width;
      canvas.height = height;
      const scaledImageData = nearestNeighborResize(originalImageData, canvas.width, canvas.height);
        
      const widthValue = document.getElementById('width-value');
      const heightValue = document.getElementById('height-value');
  
      widthValue.textContent =  parseInt(canvas.width);
      heightValue.textContent = parseInt(canvas.height);
        
      ctx.putImageData(scaledImageData, 0, 0);

  
      // Закрытие модального окна
      $("#Redact").modal("hide");
  
      // Выполнение изменения размера изображения (здесь нужно реализовать код)
      // Это включает в себя вычисление нового размера, обновление данных на странице и т.д.
    });
  
    // Обновление информации о размере изображения при открытии модального окна
    $("#Redact").on("show.bs.modal", function() {
      // Обновление информации о текущем размере изображения (здесь нужно реализовать код)
      // Это включает в себя отображение исходного размера изображения и другой связанной информации.

        const canvas = document.getElementById('image-canvas');
    
        document.getElementById('initial-pixel-info-text').textContent = Math.round(canvas.width * canvas.height/1000000);
    });
  });
  
function nearestNeighborResize(imageData, newWidth, newHeight) {
    const srcWidth = imageData.width;
    const srcHeight = imageData.height;
    const newData = new Uint8ClampedArray(newWidth * newHeight * 4);

    const xRatio = srcWidth / newWidth;
    const yRatio = srcHeight / newHeight;

    for (let y = 0; y < newHeight; y++) {
        for (let x = 0; x < newWidth; x++) {
            const srcX = Math.floor(x * xRatio);
            const srcY = Math.floor(y * yRatio);
            const srcIndex = (srcY * srcWidth + srcX) * 4;
            const dstIndex = (y * newWidth + x) * 4;

            for (let i = 0; i < 4; i++) {
                newData[dstIndex + i] = imageData.data[srcIndex + i];
            }
        }
    }

    return new ImageData(newData, newWidth, newHeight);
}

// Получение элементов DOM
const canvas = document.getElementById('image-canvas');
const ctx = canvas.getContext('2d');
const sizeRange = document.getElementById('range-input');
originalImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

// Функция изменения размера изображения
const resizeImage = (newWidth, newHeight) => {
    canvas.width = originalImageData.width * newWidth;
    canvas.height = originalImageData.height * newHeight;
    const scaledImageData = nearestNeighborResize(originalImageData, canvas.width, canvas.height);

    const widthValue = document.getElementById('width-value');
    const heightValue = document.getElementById('height-value');

    widthValue.textContent =  parseInt(canvas.width);
    heightValue.textContent = parseInt(canvas.height);

    ctx.putImageData(scaledImageData, 0, 0);
};

// Изменение размера изображения при перемещении ползунка
sizeRange.addEventListener('input', () => {
    const size = parseInt(sizeRange.value)/100;
    resizeImage(size, size);
});


$(document).ready(function() {
    // Переменная для отслеживания текущего режима (hand или pipette)
    var currentMode = '';

    // Функция для отображения информации о цвете и координатах
    function showColorInfo(color, x, y) {
        $('#color-info').removeClass('d-none').addClass('show');
        $('#color-sample').css('background-color', color);
        $('#x-coordinate').text(x);
        $('#y-coordinate').text(y);
        $('#rgb-color').text(color);
        // Здесь можно добавить логику для расчета и отображения других цветовых пространств
    }

    // Функция для получения цвета по координатам X и Y
    function getColor(x, y) {
        // Здесь можно добавить логику для получения цвета из изображения или другого источника
        // В данном примере возвращается случайный цвет
        const pixel = ctx.getImageData(x, y, 1, 1).data;
        const rgba = `${pixel[0]}, ${pixel[1]}, ${pixel[2]}`;
        return 'rgb(' + rgba + ')';

    }

    // Обработчик события клика для инструмента "Пипетка"
    $('.pipette-tool').on('click', function() {
        if(currentMode=='pipette'){
            currentMode='';
            $(this).removeClass('selected');
            $(this).css('background-color', '');
            $("#infoPanel").addClass("invisible")
        }
        else{
        currentMode = 'pipette';
        $('.tool-btn').removeClass('selected');
        $(this).addClass('selected');
        // Меняем цвет кнопки при выборе
        $(this).css('background-color', '#ffffff');
        // Возвращаем цвет кнопки по умолчанию у других кнопок
        $('.hand-tool').css('background-color', '');
        // Добавьте обработчик события клика на canvas здесь
        $("#infoPanel").removeClass("invisible")

    }
    });

    // Обработчик события клика для инструмента "Рука"
    $('.hand-tool').on('click', function() {
        if(currentMode=='hand'){
            currentMode='';
            $(this).removeClass('selected');
            $(this).css('background-color', '');
        }
        else{
            currentMode = 'hand';
            $('.tool-btn').removeClass('selected');
            $(this).addClass('selected');
            // Меняем цвет кнопки при выборе
            $(this).css('background-color', '#ffffff');
            // Возвращаем цвет кнопки по умолчанию у других кнопок
            $('.pipette-tool').css('background-color', '');
            // Добавьте обработчик события клика на canvas здесь
        }
    });

    // Обработчик события клика на canvas
    $('#image-canvas').on('click', function(event) {
        // Добавьте логику обработки клика на canvas здесь
        // Получите цвет по координатам event.pageX и event.pageY
        if(currentMode=='pipette'){
            var color = getColor(event.pageX, event.pageY);
            showColorInfo(color, event.pageX, event.pageY);
        }
    });

    // Функция для закрытия информационной панели при клике на кнопку закрытия
    $('#close-info').on('click', function() {
        $('#color-info').removeClass('show').addClass('d-none');
    });

    // Инициализация Bootstrap tooltip
    $(function () {
        $('[data-toggle="tooltip"]').tooltip();
    });
});


// Получаем ссылки на элементы в DOM
const widthInput = document.getElementById('resize-width');
const heightInput = document.getElementById('resize-height');
const preserveAspectRatioCheckbox = document.getElementById('preserve-aspect-ratio');

// Добавляем обработчики событий на поля ввода ширины и высоты
widthInput.addEventListener('input', () => {
    if (preserveAspectRatioCheckbox.checked) {
        const aspectRatio = calculateAspectRatio();
        heightInput.value = Math.round(widthInput.value / aspectRatio);
    }
    document.getElementById('next-pixel-info-text').textContent = Math.round(heightInput.value * widthInput.value / 1000000);
});

heightInput.addEventListener('input', () => {
    if (preserveAspectRatioCheckbox.checked) {
        const aspectRatio = calculateAspectRatio();
        widthInput.value = Math.round(heightInput.value * aspectRatio);
    }
    console.log( heightInput.value * widthInput.value / 1000000)
    document.getElementById('next-pixel-info-text').textContent = Math.round(heightInput.value * widthInput.value / 1000000);
});

// Функция для вычисления соотношения сторон
function calculateAspectRatio() {
    const canvas = document.getElementById('image-canvas');
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    return canvasWidth / canvasHeight;
}



// Получаем ссылку на кнопку для скачивания изображения и на элемент canvas
const downloadButton = document.getElementById('download-button');

// Добавляем обработчик события click на кнопку для скачивания изображения
downloadButton.addEventListener('click', () => {
    downloadCanvasImage(canvas, 'my_image.png');
});

// Функция для скачивания изображения из canvas
function downloadCanvasImage(canvas, filename) {
    // Получаем ссылку на изображение в формате PNG
    const image = canvas.toDataURL('image/png');
    // Создаем ссылку для скачивания изображения
    const link = document.createElement('a');
    link.href = image;
    link.download = filename;
    // Добавляем ссылку на страницу и эмулируем клик для скачивания
    document.body.appendChild(link);
    link.click();
    // Удаляем ссылку после скачивания
    document.body.removeChild(link);
}

const closeButtonPippete = document.getElementById('ClosePippete');
closeButtonPippete.addEventListener('click', () => {
    currentMode='';
    $('.pipette-tool').removeClass('selected');
    $('.pipette-tool').css('background-color', '');
    $("#infoPanel").addClass("invisible")
});