document.addEventListener('DOMContentLoaded', () => {
    
    const pepper = document.querySelector('.pepper');

    pepper.addEventListener('click', () => {
        document.documentElement.scrollTop = 0;
    });

    // Tabs

    const tabs = document.querySelectorAll('.tabheader__item'),
        tabsContent = document.querySelectorAll('.tabcontent'),
        tabsParent = document.querySelector('.tabheader__items');

    function hideTabContent() {
        tabsContent.forEach(item => {
            item.classList.add('hide');
            item.classList.remove('show', 'fade');
        });

        tabs.forEach(tab => {
            tab.classList.remove('tabheader__item_active');
        });
    }

    function showTabContent(i = 0) {
        tabsContent[i].classList.add('show', 'fade');
        tabsContent[i].classList.remove('hide');
        tabs[i].classList.add('tabheader__item_active');
    }

    hideTabContent();
    showTabContent();

    tabsParent.addEventListener('click', (event) => {
        const target = event.target;

        if (target && target.classList.contains('tabheader__item')) {
            tabs.forEach((item, i) => {
                if (target == item) {
                    hideTabContent();
                    showTabContent(i);
                }
            });
        }
    });
    
    //Timer

    const deadline = '2023-05-20';

    function getTimeRemaining(endtime) {
        const t = Date.parse(endtime) - Date.parse(new Date()),
            days = Math.floor(t / (1000 * 60 * 60 * 24)),
            hours = Math.floor((t / (1000 * 60 * 60)) % 24),
            minutes = Math.floor((t / (1000 * 60)) % 60),
            seconds = Math.floor((t / 1000) % 60);

        return {
            'total': t,
            'days': days,
            'hours': hours,
            'minutes': minutes,
            'seconds': seconds,
        };
    }

    function setClock(selector, endtime) {
        const timer = document.querySelector(selector),
            days = timer.querySelector('#days'),
            hours = timer.querySelector('#hours'),
            minutes = timer.querySelector('#minutes'),
            seconds = timer.querySelector('#seconds'),
            timeInterval = setInterval(updateClock, 1000);

        function updateClock() {
            const t = getTimeRemaining(deadline);

            days.textContent = t.days;
            hours.textContent = t.hours;
            minutes.textContent = t.minutes;
            seconds.textContent = t.seconds;

            if (t.total <= 0) {
                clearInterval(timeInterval);
                days.textContent = 0;
                hours.textContent = 0;
                minutes.textContent = 0;
                seconds.textContent = 0;
            }
        }
    }
 
    setClock('.timer', deadline);


    // Modal window connect with us

    const modalWindow = document.querySelector('.modal'),
        triggerButtons = document.querySelectorAll('[data-modal]');


    function closeModal() {
        modalWindow.classList.toggle('show');
        document.body.style.overflow = '';
    }

    function openModal() {
        modalWindow.classList.toggle('show');
        document.body.style.overflow = 'hidden';
        clearInterval(showModalTimer);
    }

    triggerButtons.forEach(btn => {
        btn.addEventListener('click', openModal);
    });

    modalWindow.addEventListener('click', (event) => {
        if (event.target === modalWindow || event.target.getAttribute('data-close') == '') {
            closeModal();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.code === 'Escape' && modalWindow.classList.contains('show')) {
            closeModal();
        }
    });

    // Modal show timer
    const showModalTimer = setTimeout(openModal, 50000);

    function showModalByScroll() {
        if (window.pageYOffset + document.documentElement.clientHeight >=
            document.documentElement.scrollHeight) {
            openModal();
            window.removeEventListener('scroll', showModalByScroll);
        }
    }

    window.addEventListener('scroll', showModalByScroll);


    // Use classes for cards

    class MenuCard {
        constructor(src, alt, title, description, price, parentSelector, ...classes) {
            this.src = src;
            this.alt = alt;
            this.title = title;
            this.description = description;
            this.price = price;
            this.classes = classes;
            this.transfer = 63;
            this.parent = document.querySelector(parentSelector);
            this.changeToRYB();

        }

        changeToRYB() {
            this.price = this.price * this.transfer;
        }

        renderHTML() {
            const element = document.createElement('div');

            if (this.classes.length === 0) {
                this.element = 'menu__item';
                element.classList.add(this.element);
            } else {
                this.classes.forEach(className => element.classList.add(className));
            }

            element.innerHTML = `
            <img src=${this.src} alt=${this.alt}>
            <h3 class="menu__item-subtitle">${this.title}</h3>
            <div class="menu__item-descr">${this.description}</div>
            <div class="menu__item-divider"></div>
            <div class="menu__item-price">
                <div class="menu__item-cost">Цена:</div>
                <div class="menu__item-total"><span>${this.price}</span> руб/день</div>
            </div>
        `;

            this.parent.append(element);

        }
    }

    const getResource = async (url) => {
        const result = await fetch(url);

        if (!result.ok) {
            throw new Error(`Could not fetch ${url}, 
        status ${result.status}, ${result.status.text}`);
        }

        return await result.json();
    };

    // getResource('http://localhost:3000/menu')
    //     .then(data => {
    // data.forEach(({img, altimg, title, descr, price}) => {
    //     new MenuCard(img, altimg, title, descr, price, '.menu .container').renderHTML();
    // });
    //     });

    axios.get('http://localhost:3000/menu')
        .then(data => {
            data.data.forEach(({
                img,
                altimg,
                title,
                descr,
                price
            }) => {
                new MenuCard(img, altimg, title, descr, price, '.menu .container').renderHTML();
            });
        });

    // Forms

    const forms = document.querySelectorAll('form');

    const message = {
        loading: 'img/spinner.svg',
        success: 'Спасибо! Скоро вам придет сообщение на почту',
        failure: 'Мы обосрались... А МОЖЕТ ТЫ?',
    };

    forms.forEach(item => {
        bindPostData(item);
    });

    const postData = async (url, data) => {
        const result = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-type': 'application/json'
            },
            body: data
        });

        return await result.json();
    };

    function bindPostData(form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const statusMessage = document.createElement('img');
            statusMessage.src = message.loading;
            statusMessage.style.cssText = `
            display: block;
            margin: 0 auto;
        `;

            form.insertAdjacentElement('afterend', statusMessage);

            const formData = new FormData(form);

            const json = JSON.stringify(Object.fromEntries(formData.entries()));

            postData('http://localhost:3000/requests', json)
                .then(data => {
                    console.log(data);
                    showThanksModal(message.success);
                    statusMessage.remove();
                }).catch(() => {
                    showThanksModal(message.failure);
                }).finally(() => {
                    form.reset();
                });

        });
    }

    // Modal for user

    function showThanksModal(message) {
        const preModalDialog = document.querySelector('.modal__dialog');

        preModalDialog.classList.add('hide');
        openModal();

        const thanksModal = document.createElement('div');
        thanksModal.classList.add('modal__dialog');
        thanksModal.innerHTML = `
            <div class="modal__content">
                <div class="modal__close" data-close>×</div>
                <div class="modal__title">${message}</div>
            </div>
        `;

        document.querySelector('.modal').append(thanksModal);
        setTimeout(() => {
            thanksModal.remove();
            preModalDialog.classList.add('show');
            preModalDialog.classList.remove('hide');
            closeModal();
        }, 4000);
    }

    fetch('db.json')
        .then(data => data.json())
        .then(res => console.log(res));


    // Slider

    const sliders = document.querySelectorAll('.offer__slide'),
        sliderWrapper = document.querySelector('.offer__slider-wrapper'),
        slider = document.querySelector('.offer__slider'),
        previosBtn = document.querySelector('.offer__slider-prev'),
        total = document.querySelector('#total'),
        current = document.querySelector('#current'),
        nextBtn = document.querySelector('.offer__slider-next'),
        sliderCarousel = document.querySelector('.offer__slider-inner'),
        width = window.getComputedStyle(sliderWrapper).width;

    let slideIndex = 1;
    let offset = 0;

    // Variant #2

    if (sliders.length < 10) {
        total.textContent = `0${sliders.length}`;
        current.textContent = `0${slideIndex}`;
    } else {
        total.textContent = sliders.length;
        current.textContent = slideIndex;
    }

    sliderCarousel.style.width = 100 * sliders.length + '%';
    sliderCarousel.style.display = 'flex';
    sliderCarousel.style.transition = '0.5s all';

    sliderWrapper.style.overflow = 'hidden';

    sliders.forEach(slide => {
        slide.style.width = width;
    });

    slider.style.position = 'relative';

    const dots = document.createElement('ol'),
        dotsArray = [];
    dots.classList.add('carousel-indicators');

    slider.append(dots);

    for (let i = 0; i < sliders.length; i++) {
        const dot = document.createElement('li');
        dot.setAttribute('data-slide-to', i + 1);
        dot.classList.add('dot');

        if (i == 0) {
            dot.style.opacity = 1;
        }

        dots.append(dot);
        dotsArray.push(dot);
    }

    function dotsChangeActiveStyle() {
        dotsArray.forEach(dot => dot.style.opacity = '.5');
        dotsArray[slideIndex - 1].style.opacity = 1;
    }

    function displaySlideNumeration() {
        if (sliders.length < 10) {
            current.textContent = `0${slideIndex}`;
        } else {
            current.textContent = slideIndex;
        }
    }

    function deleteNonDigits(str) {
        return +str.replace(/\D/g, '');
    }

    nextBtn.addEventListener('click', () => {
        if (offset == deleteNonDigits(width) * (sliders.length - 1)) {
            offset = 0;
        } else {
            offset += deleteNonDigits(width);
        }

        sliderCarousel.style.transform = `translateX(-${offset}px)`;

        if (slideIndex == sliders.length) {
            slideIndex = 1;
        } else {
            slideIndex++;
        }

        displaySlideNumeration();
        dotsChangeActiveStyle();
    });

    previosBtn.addEventListener('click', () => {
        if (offset == 0) {
            offset = deleteNonDigits(width) * (sliders.length - 1);
        } else {
            offset -= deleteNonDigits(width);
        }

        sliderCarousel.style.transform = `translateX(-${offset}px)`;

        if (slideIndex == 1) {
            slideIndex = sliders.length;
        } else {
            slideIndex--;
        }

        displaySlideNumeration();
        dotsChangeActiveStyle();
    });

    dotsArray.forEach(dot => {
        dot.addEventListener('click', (e) => {
            const slideTo = e.target.getAttribute('data-slide-to');

            slideIndex = slideTo;
            offset = deleteNonDigits(width) * (slideTo - 1);

            sliderCarousel.style.transform = `translateX(-${offset}px)`;

            displaySlideNumeration();
            dotsChangeActiveStyle();
        });
    });
    // Variant #1
    // showSlides(slideIndex);

    // if (sliders.length < 10) {
    //     total.textContent = `0${sliders.length}`;
    // } else {
    //     total.textContent = sliders.length;
    // }

    // function showSlides(n) {
    //     if (n > sliders.length) {
    //         slideIndex = 1;
    //     }

    //     if (n < 1) {
    //         slideIndex = sliders.length;
    //     }

    //     sliders.forEach(item => item.style.display = 'none');
    //     sliders[slideIndex - 1].style.display = 'block';

    //     if (sliders.length < 10) {
    //         current.textContent = `0${slideIndex}`;
    //     } else {
    //         current.textContent = slideIndex;
    //     }

    // }

    // function plusSlide(n) {
    //     showSlides(slideIndex += n);
    // }

    // previosBtn.addEventListener('click', () => {
    //     plusSlide(-1);
    // });

    // nextBtn.addEventListener('click', () => {
    //     plusSlide(1);
    // });

    // Calculator

    const result = document.querySelector('.calculating__result span');
    let sex, ratio, height, weight, age;

    if (localStorage.getItem('sex')) {
        sex = localStorage.getItem('sex');
    } else {
        sex = 'female';
        localStorage.setItem('sex', sex);
    }

    if (localStorage.getItem('ratio')) {
        ratio = localStorage.getItem('ratio');
    } else {
        ratio = 1.375;
        localStorage.setItem('ratio', ratio);
    }

    function calcTotal() {
        if (!sex || !height || !weight || !age || !ratio) {
            result.textContent = '____';
            return;
        }

        if (sex === 'female') {
            result.textContent = Math.round(
                (447.6 + (9.2 * weight) + (3.1 * height) - (4.3 * age)) * ratio);
        } else {
            result.textContent = Math.round(
                (88.36 + (13.4 * weight) + (4.8 * height) - (5.7 * age)) * ratio);
        }
    }

    calcTotal();

    function initLocalSettings(selector, activeClass) {
        const elements = document.querySelectorAll(selector);

        elements.forEach(elem => {
            elem.classList.remove(activeClass);

            if (elem.getAttribute('id') === localStorage.getItem('sex')) {
                elem.classList.add(activeClass);
            }

            if (elem.getAttribute('data-ratio') === localStorage.getItem('ratio')) {
                elem.classList.add(activeClass);
            }
        });
    }

    initLocalSettings('#gender div', 'calculating__choose-item_active');
    initLocalSettings('.calculating__choose_big div', 'calculating__choose-item_active');

    function getStaticInformation(selector, activeClass) {
        const elements = document.querySelectorAll(selector);

        elements.forEach(elem => {
            elem.addEventListener('click', (e) => {
                if (e.target.getAttribute('data-ratio')) {
                    ratio = +e.target.getAttribute('data-ratio');
                    localStorage.setItem('ratio', ratio);
                } else {
                    sex = e.target.getAttribute('id');
                    localStorage.setItem('sex', sex);
                }
    
                elements.forEach(elem => {
                    elem.classList.remove(activeClass);
                });
    
                e.target.classList.add(activeClass);
    
                calcTotal();
    
            });
        });
    }

    getStaticInformation('#gender div', 'calculating__choose-item_active');
    getStaticInformation('.calculating__choose_big div', 'calculating__choose-item_active');

    function getDymanicInformation(selector) {
        const input = document.querySelector(selector);

        input.addEventListener('input', () => {

            if(input.value.match(/\D/g)) {
                input.style.border = '1px solid red';
            } else {
                input.style.border = 'none';
            }

            switch(input.getAttribute('id')) {
                case 'height':
                    height = +input.value;
                    break;
                case 'weight':
                    weight = +input.value;
                    break;
                case 'age':
                    age = +input.value;
                    break;
            }

            calcTotal();

            console.log(weight, height, age, sex, ratio);
        });
    }

    getDymanicInformation('#height');
    getDymanicInformation('#weight');
    getDymanicInformation('#age');
});