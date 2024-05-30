let originalImageData; // сохраняем оригинальное изображение

document.getElementById('image-input').addEventListener('change', handleImage);
var currentMode = '';
let dragSpeed = 5;

const speedRange = document.getElementById('speedRange');
speedRange.addEventListener('input', () => {
    dragSpeed = parseInt(speedRange.value);
});


function drawCurve(ctx) {

    ctx.clearRect(0, 0, graphCanvas.width, graphCanvas.height);
    drawHistogram();

    // Начинаем путь
    ctx.beginPath();
    ctx.moveTo(0, graphCanvas.height);

    // Рисуем кривую градационной коррекции
    for (var x = 0; x < graphCanvas.width; x++) {
        var y = graphCanvas.height - ((x) ** 2 / (graphCanvas.width ** 2)) * graphCanvas.height;
        ctx.lineTo(x, y);
    }

    // Заканчиваем путь и рисуем
    ctx.strokeStyle = "blue";
    ctx.stroke();
}
const img = new Image();

function handleImage(event) {


    const input = event.target;
    const canvas = document.getElementById('image-canvas');
    const widthValue = document.getElementById('width-value');
    const heightValue = document.getElementById('height-value');
    const colorValues = document.getElementById('color-values');
    const pixelCoordinates = document.getElementById('pixel-coordinates');

    var graphCanvas = document.getElementById("graphCanvas");
    var graphCtx = graphCanvas.getContext("2d");



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

        drawHistogram();
        // drawCurve(graphCtx);

    
    };


    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);


    let imageX = 0;
    let imageY = 0;
    // let imageWidth = 0;
    // let imageHeight = 0;




    function moveImage(deltaX, deltaY) {
        const style = window.getComputedStyle(canvas);
        const marginLeft = parseInt(style.marginLeft) || 0;
        const marginTop = parseInt(style.marginTop) || 0;
    
        const canvasWidth = canvas.offsetWidth;
        const canvasHeight = canvas.offsetHeight;
    
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
    
        const minVisibleWidth = canvasWidth * 0.1;
        const minVisibleHeight = canvasHeight * 0.1;
    
        let newMarginLeft = marginLeft + deltaX;
        let newMarginTop = marginTop + deltaY;
    
        // Ограничение по горизонтали
        if (newMarginLeft > viewportWidth - minVisibleWidth) {
            newMarginLeft = viewportWidth - minVisibleWidth;
        }
        if (newMarginLeft < -(canvasWidth - minVisibleWidth)) {
            newMarginLeft = -(canvasWidth - minVisibleWidth);
        }
    
        // Ограничение по вертикали
        if (newMarginTop > viewportHeight - minVisibleHeight) {
            newMarginTop = viewportHeight - minVisibleHeight;
        }
        if (newMarginTop < -(canvasHeight - minVisibleHeight)) {
            newMarginTop = -(canvasHeight - minVisibleHeight);
        }
    
        canvas.style.marginLeft = `${newMarginLeft}px`;
        canvas.style.marginTop = `${newMarginTop}px`;
    }
    

    // Function to handle key down event
    function handleKeyDown(event) {
        if(currentMode==="hand"){
            switch (event.key) {
                case 'ArrowLeft':
                    moveImage(-dragSpeed, 0);
                    event.preventDefault();
                    break;
                case 'ArrowRight':
                    moveImage(dragSpeed, 0);
                    event.preventDefault();
                    break;
                case 'ArrowUp':
                    moveImage(0, -dragSpeed);
                    event.preventDefault();
                    break;
                case 'ArrowDown':
                    moveImage(0, dragSpeed);
                    event.preventDefault();
                    break;
            }
        }
    }
    document.addEventListener('keydown', handleKeyDown);

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

let color_main,color_alt;
$(document).ready(function() {
    // Переменная для отслеживания текущего режима (hand или pipette)

    
    // Функция для отображения информации о цвете и координатах
    function showColorInfo(color, x, y,isalt=false) {
    
        if(isalt){
            color_main = ctx.getImageData(x, y, 1, 1).data;
            const pixel = ctx.getImageData(x, y, 1, 1).data;
            $('#color-info-alt').removeClass('d-none').addClass('show');
            $('#color-sample-alt').css('background-color', color);
            $('#x-coordinate-alt').text(x);
            $('#y-coordinate-alt').text(y);
            $('#rgb-color-alt').text(color)
            $('#xyz-color-alt').text(rgbToXyz(pixel[0],pixel[1],pixel[2]));
            $('#lab-color-alt').text(rgbToLab(pixel[0],pixel[1],pixel[2]));
            $('#luminance-alt').text(calculateRelativeLuminance(pixel[0],pixel[1],pixel[2]).toFixed(2));
            document.getElementById('colorDisplay-alt').style.backgroundColor = 'rgb(' + pixel[0] + ',' + pixel[1] + ',' + pixel[2] + ')';
        }
        else{
            color_alt = ctx.getImageData(x, y, 1, 1).data;
            const pixel = ctx.getImageData(x, y, 1, 1).data;
            $('#color-info').removeClass('d-none').addClass('show');
            $('#color-sample').css('background-color', color);
            $('#x-coordinate').text(x);
            $('#y-coordinate').text(y);
            $('#rgb-color').text(color)
            $('#xyz-color').text(rgbToXyz(pixel[0],pixel[1],pixel[2]));
            $('#lab-color').text(rgbToLab(pixel[0],pixel[1],pixel[2]));
            $('#luminance').text(calculateRelativeLuminance(pixel[0],pixel[1],pixel[2]).toFixed(2));
            document.getElementById('colorDisplay').style.backgroundColor = 'rgb(' + pixel[0] + ',' + pixel[1] + ',' + pixel[2] + ')'
        }

        if (color_main!==undefined && color_alt!==undefined){
            constrast = calcContrast(color_main,color_alt).toFixed(1)

                $('#contrast').text(constrast);
            if(constrast<4.5){
                $('#NotEnough').text("контраст недостаточный");
            }
            else{
                $('#NotEnough').text("");
            }
        }
        // Здесь можно добавить логику для расчета и отображения других цветовых пространств
    }

    


    // Функция для получения цвета по координатам X и Y
    function getColor(x, y) {
        // Здесь можно добавить логику для получения цвета из изображения или другого источника
        // В данном примере возвращается случайный цвет
        const pixel = ctx.getImageData(x, y, 1, 1).data;
        const rgba = `${pixel[0]}, ${pixel[1]}, ${pixel[2]}`;
        return '(' + rgba + ')';

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
        if(currentMode==='hand'){
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

            if (event.altKey || event.ctrlKey || event.shiftKey) {
                var color = getColor(event.pageX, event.pageY);
                showColorInfo(color, event.pageX, event.pageY,true);
            }
            else{
                var color = getColor(event.pageX, event.pageY);
                showColorInfo(color, event.pageX, event.pageY);
            }
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
const graphButton = document.getElementById('graph-button');

// Добавляем обработчик события click на кнопку для скачивания изображения
downloadButton.addEventListener('click', () => {
    downloadCanvasImage(canvas, 'my_image.png');
});

$('#FilterModal').on('shown.bs.modal', function () {
    $('body').removeClass('modal-open');
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

function rgbToXyz(r, g, b, data = false) {
    // Normalize the RGB values to the range 0-1
    r = r / 255;
    g = g / 255;
    b = b / 255;

    // Apply a gamma correction to linearize the RGB values
    r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
    g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
    b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

    // Convert the linear RGB values to the XYZ color space
    const x = r * 0.4124564 + g * 0.3575761 + b * 0.1804375;
    const y = r * 0.2126729 + g * 0.7151522 + b * 0.0721750;
    const z = r * 0.0193339 + g * 0.1191920 + b * 0.9503041;

    if (data) {
        return { x, y, z };
    }
    const XYZ = `${x.toFixed(2)}, ${y.toFixed(2)}, ${z.toFixed(2)}`;
    return '(' + XYZ + ')';
}

// Function to convert XYZ to LAB
function xyzToLab(x, y, z) {
    // D65 standard reference values
    const refX = 95.047;
    const refY = 100.000;
    const refZ = 108.883;

    x = x / refX;
    y = y / refY;
    z = z / refZ;

    x = x > 0.008856 ? Math.cbrt(x) : (7.787 * x) + (16 / 116);
    y = y > 0.008856 ? Math.cbrt(y) : (7.787 * y) + (16 / 116);
    z = z > 0.008856 ? Math.cbrt(z) : (7.787 * z) + (16 / 116);

    const l = (116 * y) - 16;
    const a = 500 * (x - y);
    const b = 200 * (y - z);

    return {
        l: l.toFixed(2),
        a: a.toFixed(2),
        b: b.toFixed(2)
    };
}

function rgbToLab(r, g, b) {
    // Функция для преобразования RGB в XYZ
    function rgbToXyz(r, g, b) {
        const [var_R, var_G, var_B] = [r, g, b]
            .map(x => x / 255)
            .map(x => x > 0.04045
                ? Math.pow(((x + 0.055) / 1.055), 2.4)
                : x / 12.92)
            .map(x => x * 100)
    
        // Observer. = 2°, Illuminant = D65
        const x = var_R * 0.4124 + var_G * 0.3576 + var_B * 0.1805
        const y = var_R * 0.2126 + var_G * 0.7152 + var_B * 0.0722
        const z = var_R * 0.0193 + var_G * 0.1192 + var_B * 0.9505
        return {x:x.toFixed(2), y:y.toFixed(2), z:z.toFixed(2)}
    }

    function xyzToLab(x, y, z) {
        const refX = 95.047;
        const refY = 100.000;
        const refZ = 108.883;

        const [ var_X, var_Y, var_Z ] = [ x / refX, y / refY, z / refZ ]
            .map(a => a > 0.008856
                ? Math.pow(a, 1 / 3)
                : (7.787 * a) + (16 / 116))
    
        const l = (116 * var_Y) - 16
        const a = 500 * (var_X - var_Y)
        const b = 200 * (var_Y - var_Z)
    
        return {l:l.toFixed(2), a:a.toFixed(2), b:b.toFixed(2)}
    }

    // Преобразование RGB в XYZ
    const { x, y, z } = rgbToXyz(r, g, b);

    // Преобразование XYZ в LAB
    const lab = xyzToLab(x, y, z);

    // Возвращаем значения LAB в виде строки
    const labText = `${lab.l}, ${lab.a}, ${lab.b}`;
    return '(' + labText + ')';
}




// Function to calculate relative luminance
function calculateRelativeLuminance(r, g, b) {
    const rgb = [r, g, b].map(value => {
        value = value / 255;
        return value <= 0.03928 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
    });

    return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
}

// Function to calculate contrast ratio
function calculateContrastRatio(rgb1, rgb2) {
    const lum1 = calculateRelativeLuminance(rgb1[0], rgb1[1], rgb1[2]);
    const lum2 = calculateRelativeLuminance(rgb2[0], rgb2[1], rgb2[2]);
    return (Math.max(lum1, lum2) + 0.05) / (Math.min(lum1, lum2) + 0.05);
}



function drawHistogram() {
    drawAxes();

    var imageCanvas = document.getElementById("image-canvas");
    let imageCtx = imageCanvas.getContext("2d");
    var graphCtx = graphCanvas.getContext("2d");
    var imageData = imageCtx.getImageData(0, 0, img.width, img.height);
    var data = imageData.data;


    // Инициализируем массивы для хранения значений гистограммы для каждого канала
    var histogram = {
        r: new Array(256).fill(0),
        g: new Array(256).fill(0),
        b: new Array(256).fill(0)
    };

    // Заполняем массивы гистограммы
    for (var i = 0; i < data.length; i += 4) {
        histogram.r[data[i]]++;
        histogram.g[data[i + 1]]++;
        histogram.b[data[i + 2]]++;
    }

    // Находим максимальное значение в гистограмме для нормализации высоты столбцов
    var maxCount = Math.max(
        ...histogram.r,
        ...histogram.g,
        ...histogram.b
    );

    // Очищаем canvas и рисуем гистограмму
    // graphCtx.clearRect(0, 0, graphCanvas.width, graphCanvas.height);

    var barWidth = graphCanvas.width / 256;

    // Рисуем гистограмму
    for (var j = 0; j < 256; j++) {
        var barHeightR = (histogram.r[j] / maxCount) * graphCanvas.height;
        var barHeightG = (histogram.g[j] / maxCount) * graphCanvas.height;
        var barHeightB = (histogram.b[j] / maxCount) * graphCanvas.height;

        // Рисуем красный канал
        graphCtx.fillStyle = 'rgba(255, 0, 0, 0.3)';
        graphCtx.fillRect(j * barWidth, graphCanvas.height - barHeightR, barWidth, barHeightR);

        // Рисуем зеленый канал
        graphCtx.fillStyle = 'rgba(0, 255, 0, 0.3)';
        graphCtx.fillRect(j * barWidth, graphCanvas.height - barHeightG, barWidth, barHeightG);

        // Рисуем синий канал
        graphCtx.fillStyle = 'rgba(0, 0, 255, 0.3)';
        graphCtx.fillRect(j * barWidth, graphCanvas.height - barHeightB, barWidth, barHeightB);
    }
}



const updateButton = document.getElementById('updateGraph');
const applyCorrection = document.getElementById('applyCorrection');


function makegraph(applyCorr=false){

    var graphCanvas = document.getElementById("graphCanvas");
    var graphCtx = graphCanvas.getContext("2d");
    // graphCtx.setTransform(1, 0, 0, -1, 0, graphCanvas.height);
    var imageCanvas = document.getElementById("image-canvas");
    let imageCtx = imageCanvas.getContext("2d");

    graphCtx.clearRect(0, 0, graphCanvas.width, graphCanvas.height);



    drawHistogram();
    // drawCurve(graphCtx);

    // Получаем значения входных и выходных точек
    var input_x = parseInt(document.getElementById("input_x").value);
    var input_y = parseInt(document.getElementById("input_y").value);
    var output_x = parseInt(document.getElementById("output_x").value);
    var output_y = parseInt(document.getElementById("output_y").value);

    // Проверяем ограничения
    if (output_x <= input_x || output_y <= input_y) {
        alert("Ошибка: значения x и y выходной точки должны быть больше x и y входной точки соответственно.");
        // Остановка выполнения функции
        return;
    }

    // Ограничение значения output_x и output_y до максимального значения 255
    output_x = Math.min(output_x, 255);
    output_y = Math.min(output_y, 255);

    // Инициализируем график
    drawGraph(graphCtx);
    if(applyCorr)
            applyCorrectionToImage(imageCtx);

    // Функция для рисования графика градационной коррекции с точками
    function drawGraph(ctx) {

        graphCtx.setTransform(1, 0, 0, -1, 0, graphCtx.height);
        // Инвертируем координаты Y
        var inverted_input_y = graphCanvas.height - (input_y * graphCanvas.height / 255);
        var inverted_output_y = graphCanvas.height - (output_y * graphCanvas.height / 255);

        // Рисуем точки
        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.arc(input_x * graphCanvas.width / 255, inverted_input_y, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(output_x * graphCanvas.width / 255, inverted_output_y, 5, 0, Math.PI * 2);
        ctx.fill();

        // Соединяем точки линией
        ctx.strokeStyle = "blue";
        ctx.beginPath();
        ctx.moveTo(input_x * graphCanvas.width / 255, inverted_input_y);
        ctx.lineTo(output_x * graphCanvas.width / 255, inverted_output_y);
        ctx.stroke();

        // Горизонтальная линия от меньшей точки влево
        ctx.beginPath();
        ctx.moveTo(input_x * graphCanvas.width / 255, inverted_input_y);
        ctx.lineTo(0, inverted_input_y);
        ctx.stroke();
        
        // Горизонтальная линия от большей точки вправо
        ctx.beginPath();
        ctx.moveTo(output_x * graphCanvas.width / 255, inverted_output_y);
        ctx.lineTo(graphCanvas.width, inverted_output_y);
        ctx.stroke();
    }

    // Функция для проведения градационной коррекции на изображении
    function applyCorrectionToImage(imageCtx) {
        var imageData = imageCtx.getImageData(0, 0, imageCanvas.width, imageCanvas.height);
        var data = imageData.data;

        for (var i = 0; i < data.length; i += 4) {
            // Применяем коррекцию к каждому каналу цвета (R, G, B)
            data[i] = applyCorrection(data[i]);     // Red
            data[i + 1] = applyCorrection(data[i + 1]); // Green
            data[i + 2] = applyCorrection(data[i + 2]); // Blue
        }

        // Помещаем скорректированные данные обратно на canvas
        imageCtx.putImageData(imageData, 0, 0);
    }

    // Функция для применения градационной коррекции к пикселю на оси x
    function applyCorrection(value) {
        if (value < input_x) {
            return input_y + (value - input_x) * (input_y / input_x);
        } else if (value > output_x) {
            return output_y + (value - output_x) * ((255 - output_y) / (255 - output_x));
        } else {
            return input_y + (value - input_x) * (output_y - input_y) / (output_x - input_x);
        }
    }
}
updateButton.addEventListener('click', () => makegraph());
applyCorrection.addEventListener('click',() => makegraph(true))

document.getElementById("resetValues").addEventListener("click", function() {
    document.getElementById("input_x").value = 0;
    document.getElementById("input_y").value = 0;
    document.getElementById("output_x").value = 0;
    document.getElementById("output_y").value = 0;

    if (document.getElementById("previewCheckbox").checked) {
            // Помещаем скорректированные данные обратно на canvas
            ctx.putImageData(originalImageData , 0, 0);
    }
});


document.getElementById("resetValuesFilter").addEventListener("click", function() {

    const presets = [
        [0, 0, 0, 0, 1, 0, 0, 0, 0],
    ];
 
    const fieldInputs = document.querySelectorAll('#grid-container-numbers input');

    const presetValues = presets[0];

    fieldInputs.forEach((input, index) => {
           input.value = presetValues[index];
    });

    document.getElementById('presetValuesOptions').selectedIndex = 0;

    if (document.getElementById("previewCheckFilter").checked) {
            // Помещаем скорректированные данные обратно на canvas
            ctx.putImageData(originalImageData , 0, 0);
    }
});


document.addEventListener('DOMContentLoaded', () => {
    // Set random values for the fields from 0 to 1
    let data =  [0, 0, 0, 0, 1, 0, 0, 0, 0]
    for (let i = 1; i <= 9; i++) {
        const field = document.getElementById(`field${i}`);
        field.value = data[i-1]
    }

    document.getElementById('apply-button').addEventListener('click', function () {
        const canvas = document.getElementById('image-canvas');
        const context = canvas.getContext('2d');

        // Example image, you can load your own image
        const mask = [
            [parseFloat(document.getElementById('field1').value) || 0,
            parseFloat(document.getElementById('field2').value) || 0,
            parseFloat(document.getElementById('field3').value) || 0],
            [parseFloat(document.getElementById('field4').value) || 0,
            parseFloat(document.getElementById('field5').value) || 0,
            parseFloat(document.getElementById('field6').value) || 0],
            [parseFloat(document.getElementById('field7').value) || 0,
            parseFloat(document.getElementById('field8').value) || 0,
            parseFloat(document.getElementById('field9').value) || 0],
        ];
        const presetValuesSelect = document.getElementById('presetValuesOptions');
        const selectedPreset = presetValuesSelect.value;

        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        switch(Number(selectedPreset[selectedPreset.length-1])){
            case 1:
                applyNothing(ctx.getImageData(0, 0, canvas.width, canvas.height), canvas.width,canvas.height,mask);
                break;
            case  2:
                const sharpenedImageData = applySharpeningFilter(context, imageData,mask);
                context.putImageData(sharpenedImageData, 0, 0);
                break;
            case 3:
                const GaussImageData = applyGaussianBlurFilter(context, imageData,mask);
                context.putImageData(GaussImageData, 0, 0);
                break;
            case 4:
                const BoxImageData = applyBoxBlurFilter(context, imageData,mask);
                context.putImageData(BoxImageData, 0, 0);
                break;
        }
    });
});



function makeImageMatrix(imageData, imageWidth) {
    let imageMatrix = [];

	for (let y = 1; y <= imageData.length / (imageWidth * 4); y++) {
		imageMatrix[y] = [];
		let x = 1;
		for (let i = imageWidth * 4 * (y - 1); i < imageWidth * 4 * y; i++) {
			imageMatrix[y][x] = imageData[i];
			x += 1;
		}
	}

    return imageMatrix;
}


function applyNothing(imageData, width,height, kernel) {
    let buffer = new Uint8ClampedArray(width * height * 4);
    let imageMatrix = makeImageMatrix(imageData.data, width);
    imageMatrix = edgeHandling(imageMatrix, width, height);

    let pos = 0;

    for (let y = 2; y <= height + 1; y++) {
		for (let x = 8; x <= width * 4 + 4; x+=4) {
            let R = 0;
            let G = 0;
            let B = 0;
            for (let s = -1; s <= 1; s++) {
                for (let t = -1; t <= 1; t++) {
                    R += kernel[s + 1][t + 1] * imageMatrix[y + t][x - 3 + s * 4];
                    G += kernel[s + 1][t + 1] * imageMatrix[y + t][x - 2 + s * 4];
                    B += kernel[s + 1][t + 1] * imageMatrix[y + t][x - 1 + s * 4];
                }
            }

            buffer[pos] = R;
            buffer[pos + 1] = G;
            buffer[pos + 2] = B;
            buffer[pos + 3] = 255;

            pos += 4;
        }
    }


    // ctx.putImageData(new ImageData(buffer, width, height), 0, 0);
    imageData.data.set(buffer);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.putImageData(imageData, 0, 0);

}


// Helper functions remain the same...

function applySharpeningFilter(context, imageData,matrix) {
            const width = imageData.width;
            const height = imageData.height;
            const src = imageData.data;
            const output = context.createImageData(width, height);
            const dst = output.data;

            // Sharpening matrix
            //  matrix = [
            //     [0, -1, 0],
            //     [-1, 5, -1],
            //     [0, -1, 0]
            // ];
            const matrixSize = 3;
            const halfMatrixSize = Math.floor(matrixSize / 2);

            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    let r = 0, g = 0, b = 0;

                    // Apply the matrix
                    for (let ky = -halfMatrixSize; ky <= halfMatrixSize; ky++) {
                        for (let kx = -halfMatrixSize; kx <= halfMatrixSize; kx++) {
                            const weight = matrix[ky + halfMatrixSize][kx + halfMatrixSize];
                            const px = Math.min(width - 1, Math.max(0, x + kx));
                            const py = Math.min(height - 1, Math.max(0, y + ky));
                            const pixelIndex = (py * width + px) * 4;
                            r += src[pixelIndex] * weight;
                            g += src[pixelIndex + 1] * weight;
                            b += src[pixelIndex + 2] * weight;
                        }
                    }

                    const dstIndex = (y * width + x) * 4;
                    dst[dstIndex] = Math.min(Math.max(r, 0), 255);
                    dst[dstIndex + 1] = Math.min(Math.max(g, 0), 255);
                    dst[dstIndex + 2] = Math.min(Math.max(b, 0), 255);
                    dst[dstIndex + 3] = src[dstIndex + 3]; // alpha
                }
            }

            return output;
    }

    function applyGaussianBlurFilter(context, imageData,matrix) {
        const width = imageData.width;
        const height = imageData.height;
        const src = imageData.data;
        const output = context.createImageData(width, height);
        const dst = output.data;
        // Gaussian blur matrix
        // const matrix = [
        //     [1, 2, 1],
        //     [2, 4, 2],
        //     [1, 2, 1]
        // ];
        const matrixSize = 3;
        const matrixSum = 16; // Sum of all values in the matrix
        const halfMatrixSize = Math.floor(matrixSize / 2);

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let r = 0, g = 0, b = 0;

                // Apply the matrix
                for (let ky = -halfMatrixSize; ky <= halfMatrixSize; ky++) {
                    for (let kx = -halfMatrixSize; kx <= halfMatrixSize; kx++) {
                        const weight = matrix[ky + halfMatrixSize][kx + halfMatrixSize];
                        const px = Math.min(width - 1, Math.max(0, x + kx));
                        const py = Math.min(height - 1, Math.max(0, y + ky));
                        const pixelIndex = (py * width + px) * 4;
                        r += src[pixelIndex] * weight;
                        g += src[pixelIndex + 1] * weight;
                        b += src[pixelIndex + 2] * weight;
                    }
                }

                const dstIndex = (y * width + x) * 4;
                dst[dstIndex] = Math.min(Math.max(r / matrixSum, 0), 255);
                dst[dstIndex + 1] = Math.min(Math.max(g / matrixSum, 0), 255);
                dst[dstIndex + 2] = Math.min(Math.max(b / matrixSum, 0), 255);
                dst[dstIndex + 3] = src[dstIndex + 3]; // alpha
            }
        }

        return output;
    }

    function applyBoxBlurFilter(context, imageData,matrix) {
        const width = imageData.width;
        const height = imageData.height;
        const src = imageData.data;
        const output = context.createImageData(width, height);
        const dst = output.data;

        // Box blur matrix (3x3)
        // const matrix = [
        //     [1, 1, 1],
        //     [1, 1, 1],
        //     [1, 1, 1]
        // ];
        const matrixSize = 3;
        const matrixSum = 9; // Sum of all values in the matrix
        const halfMatrixSize = Math.floor(matrixSize / 2);

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let r = 0, g = 0, b = 0;

                // Apply the matrix
                for (let ky = -halfMatrixSize; ky <= halfMatrixSize; ky++) {
                    for (let kx = -halfMatrixSize; kx <= halfMatrixSize; kx++) {
                        const weight = matrix[ky + halfMatrixSize][kx + halfMatrixSize];
                        const px = Math.min(width - 1, Math.max(0, x + kx));
                        const py = Math.min(height - 1, Math.max(0, y + ky));
                        const pixelIndex = (py * width + px) * 4;
                        r += src[pixelIndex] * weight;
                        g += src[pixelIndex + 1] * weight;
                        b += src[pixelIndex + 2] * weight;
                    }
                }

                const dstIndex = (y * width + x) * 4;
                dst[dstIndex] = Math.min(Math.max(r / matrixSum, 0), 255);
                dst[dstIndex + 1] = Math.min(Math.max(g / matrixSum, 0), 255);
                dst[dstIndex + 2] = Math.min(Math.max(b / matrixSum, 0), 255);
                dst[dstIndex + 3] = src[dstIndex + 3]; // alpha
            }
        }

        return output;
    }





document.addEventListener('DOMContentLoaded', () => {
    const presets = [
         [0, 0, 0, 0, 1, 0, 0, 0, 0],
         [0, -1, 0, -1, 5, -1, 0, -1, 0],
         [1, 2, 1, 2, 4, 2, 1, 2, 1],
         [1, 1, 1, 1, 1, 1, 1, 1, 1],
    ];

    const presetValuesSelect = document.getElementById('presetValuesOptions');
    const fieldInputs = document.querySelectorAll('#grid-container-numbers input');

    presetValuesSelect.addEventListener('change', () => {
        const selectedPreset = presetValuesSelect.value;
        const presetValues = presets[Number(selectedPreset[selectedPreset.length-1])-1];

        fieldInputs.forEach((input, index) => {
            input.value = presetValues[index];
        });
    });
});


function edgeHandling(imageMatrix, width, height) {
    width = width * 4;
    let newImageMatrix = [];

    for (let y = 1; y <= height + 2; y++) {
        newImageMatrix[y] = [];
    }

    function setRGBA(x1, y1, x2, y2) {
        newImageMatrix[y1][x1 - 3] = newImageMatrix[y2][x2 - 3];
        newImageMatrix[y1][x1 - 2] = newImageMatrix[y2][x2 - 2];
        newImageMatrix[y1][x1 - 1] = newImageMatrix[y2][x2 - 1];
        newImageMatrix[y1][x1] = newImageMatrix[y2][x2];
    }

    for (let y = 1; y <= height; y++) {
		for (let x = 4; x <= width; x+=4) {
            newImageMatrix[y + 1][x - 3 + 4] = imageMatrix[y][x - 3];
            newImageMatrix[y + 1][x - 2 + 4] = imageMatrix[y][x - 2];
            newImageMatrix[y + 1][x - 1 + 4] = imageMatrix[y][x - 1];
            newImageMatrix[y + 1][x + 4] = imageMatrix[y][x];            
        }
    }



    for (let x = 8; x <= width + 4; x+=4) {
        setRGBA(x, 1, x, 2);
    }

    for (let x = 8; x <= width + 4; x+=4) {
        setRGBA(x, height + 2, x, height + 1);
    }

    for (let y = 2; y <= height + 1; y++) {
        setRGBA(4, y, 8, y);
    }

    for (let y = 2; y <= height + 1; y++) {
        setRGBA(width + 8, y, width + 4, y);
    }

    setRGBA(4, 1, 8, 2);
    setRGBA(width + 8, 1, width + 4, 2);
    setRGBA(4, height + 2, 8, height + 2);
    setRGBA(width + 8, height + 2, width + 4, height + 1);
    
    return newImageMatrix;
}


function calcContrast(rgb1, rgb2) {
    const RED = 0.2126;
    const GREEN = 0.7152;
    const BLUE = 0.0722;
    
    const GAMMA = 2.4;
    
    function luminance(r, g, b) {

      let a = [r, g, b].map((v) => {
        v /= 255;
        return v <= 0.03928
          ? v / 12.92
          : Math.pow((v + 0.055) / 1.055, GAMMA);
      });
      return a[0] * RED + a[1] * GREEN + a[2] * BLUE;
    }
    let lum1 = luminance(...rgb1);
    let lum2 = luminance(...rgb2);
    let brightest = Math.max(lum1, lum2);
    let darkest = Math.min(lum1, lum2);

    return (brightest + 0.05) / (darkest + 0.05);
}


function drawAxes() {
    const canvas = document.getElementById('graphCanvas');
    const ctx = canvas.getContext('2d');

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw X and Y axes
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    ctx.lineTo(canvas.width, canvas.height);
    ctx.lineTo(canvas.width, 0);
    ctx.strokeStyle = '#000';
    ctx.stroke();

    // Draw ticks and labels
    ctx.font = '10px Arial';
    ctx.fillStyle = '#000';

    // X axis ticks and labels
    for (let x = 0; x <= 255; x += 50) {
        ctx.moveTo(x, canvas.height);
        ctx.lineTo(x, canvas.height - 5);
        ctx.stroke();
        ctx.fillText(x, x - 5, canvas.height - 10);
    }

    // Y axis ticks and labels
    for (let y = 0; y <= 255; y += 50) {
        ctx.moveTo(0, canvas.height - y);
        ctx.lineTo(5, canvas.height - y);
        ctx.stroke();
        ctx.fillText(y, 10, canvas.height - y + 3);
    }
}
