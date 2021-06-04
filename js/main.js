// Что нужно сделать:
// 1. Функционал перемещения по карточкам, вперед и назад
// 2. Проверка на ввод данных
// 3. Получение (сбор) данных с карточек
// 4. Записывать все введенные данные
// 5. Реализовать работу прогресс бара
// 6. Подсветка рамки для радио и чекбоксов

// Объект с сохраненными ответами
var answers = {
    2: null,
    3: null,
    4: null,
    5: null
};

// Движение вперед
var btnNext = document.querySelectorAll('[data-nav="next"]');
btnNext.forEach( function(button) {
    button.addEventListener('click', function() {
        // closest - метод, кот. производит поиск по родителю эл-та, ближайший родитель, кот. соответствует введенному селектору, будет возвращен
        // this здесь будет ссылаться на тот эл-т, по которому произошло событие. Ищем ближайшую карточку-родитель
        var thisCard = this.closest('[data-card]');
        var thisCardNumber = parseInt(thisCard.dataset.card);

        if (thisCard.dataset.validate == 'novalidate') {
            navigate('next', thisCard);
            updateProgressBar('next', thisCardNumber);
        } else {
            // При движении вперед записываем ответ в объект с ответами
            saveAnswer(thisCardNumber, gatherCardData(thisCardNumber));
            // Проверка на ввод данных / Валидация на заполненность
            if (answers[thisCardNumber].answer.length > 0 && checkOnRequired(thisCardNumber)) {
                navigate('next', thisCard);
                updateProgressBar('next', thisCardNumber);
            } else {
                alert('Сделайте ответ, прежде чем переходить далее')
            }
        };
    })
})

// Движение назад
var btnPrev = document.querySelectorAll('[data-nav="prev"]');
btnPrev.forEach( function(button) {
    button.addEventListener('click', function() {
        var thisCard = this.closest('[data-card]');
        var thisCardNumber = parseInt(thisCard.dataset.card);

        navigate('prev', thisCard);
        updateProgressBar('prev', thisCardNumber);
    })
})

// Функция для перемещения между карточками
function navigate(direction, thisCard) {
    var thisCardNumber = parseInt(thisCard.dataset.card);
    var nextCard

    if (direction == 'next') nextCard = thisCardNumber + 1;
    else nextCard = thisCardNumber - 1;
    
    thisCard.classList.add('hidden');
    document.querySelector(`[data-card="${nextCard}"]`).classList.remove('hidden');
}

// Валидация - проверка результата на соответствование требованиям. В данном случае не все карточки надо валидировать. Валидировать надо только при движении вперед

// Ф-я сбора заполненных данных с карточки
function gatherCardData(number) {

    var question;
    var result = [];

    // Находим карточку по номеру и дата-атрибуту
    var currentCard = document.querySelector(`[data-card="${number}"]`);
    // Находим главный вопрос карточки
    question = currentCard.querySelector('[data-question]').innerText;
    
    // ----- 1. Находим все заполненные значения
        // Для чекбоксов и радио-кнопок можно сделать один селектор, так как обрабатываются они одинаково:
    const controls = currentCard.querySelectorAll('[type="radio"], [type="checkbox"]');
        // обходим кнопки циклом
    controls.forEach(function(item) {
        if (item.checked) {
            result.push({
                name: item.name,
                value: item.value
            })
        }
    })

    // ----- 3. Находим все заполненные эл-ты из инпутов
    var inputValues = currentCard.querySelectorAll('[type="text"], [type="number"], [type="email"]');
    inputValues.forEach(function(item) {
        itemValue = item.value; 
        if (itemValue.trim() != '') { // trim() удаляет пробельные символы с начала и конца строки
            result.push({
                name: item.name,
                value: item.value
            })
        }
    })

    var data = {
        question: question,
        answer: result
    }

    return data

}

// Ф-я записи ответа в объект с ответами
function saveAnswer(number, data) {
    // параметр data надо будет записывать в виде ф-ии gatherCardData(number), она вернет вместо себя объект
    answers[number] = data
}

// Ф-я для проверки email
function validateEmail(email) {
    var pattern = /^[\w-\.]+@[\w-]+\.[a-z]{2,4}$/i;
    return pattern.test(email);
}

// Проверка на заполненность required чекбоксов и инпутов с email
function checkOnRequired(number) {
    // Находим текущую карточку по номеру
    var currentCard = document.querySelector(`[data-card="${number}"]`);
    // Смотрим, есть ли внутри карточки теги с атрибутом required
    var requiredFields = currentCard.querySelectorAll('[required]');

    var isValidArray = true; // если будет хоть один false, то валидация не пройдена

    requiredFields.forEach(function(item) {
        if ((item.type == 'checkbox' && item.checked == false) || (item.type == 'email' && !validateEmail(item.value))) {
            isValidArray = false;
        }
    })

    return isValidArray;
}

//Подсвечиваем рамку у радиокнопок
document.querySelectorAll('.radio-group').forEach(function(item) {
    item.addEventListener('click', function(e) {
        // проверка, где произошле клик: внутри тега label или нет
        var label = e.target.closest('label'); // как бы спрашиваем: ближайший родитель label? Ответ true/false
        if (label) {
            // Отменяем активный класс у всех тегов label
            label.closest('.radio-group').querySelectorAll('label').forEach(function(item) {
                item.classList.remove('radio-block--active');
            })
            // Добавляем активный класс к label, по которому был клик
            label.classList.add('radio-block--active');
        }
    })
});

// Подсвечиваем рамку у чекбоксов
document.querySelectorAll('label.checkbox-block input[type="checkbox"]').forEach(function(item) {
    item.addEventListener('change', function() {
        // Если чекбокс проставлен, то
        if (item.checked) {
            // Добавляем активный класс к тегу label, в котором он лежит
            item.closest('label').classList.add('checkbox-block--active');
        } else {
            // в ином случае убираем активный класс
            item.closest('label').classList.remove('checkbox-block--active');
        }
    })
})

//Отображение прогресс-бара
function updateProgressBar(direction, cardNumber) {
    // Расчет кол-ва всех карточек
    var cardsTotalNumber = document.querySelectorAll('[data-card]').length;

    // Текущая карточка
    if (direction == 'next') {
        cardNumber = cardNumber + 1;
    } else if (direction == 'prev') {
        cardNumber = cardNumber - 1;
    }

    // Расчет % прохождения
    var progress = ((cardNumber * 100) / cardsTotalNumber).toFixed();

    // Обновляем прогресс-бар
    var progressBar = document
        .querySelector(`[data-card='${cardNumber}']`)
        .querySelector('.progress');

    if (progressBar) {

        // Обновляем число прогресс-бара
        progressBar
            .querySelector('.progress__label strong')
            .innerText = `${progress}%`;

        // Обновляем полоску прогресс-бара
        progressBar
            .querySelector('.progress__line-bar')
            .style = `width: ${progress}%`
    }
}
