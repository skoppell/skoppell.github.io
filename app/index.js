let endpoints = [];
let imgUrlsCache = {};
let ENDPOINTS_FILE_NAME = 'endpoints';
let ENDPOINTS_INPUT_URL = './' + ENDPOINTS_FILE_NAME + '.json';
let LOADED_TILL_INDEX = 0;
let BATCH_SIZE = 40;
let imageSpaceElem;
window.addEventListener('DOMContentLoaded', event => {
    fetch(ENDPOINTS_INPUT_URL)
        .then(response => {
            return response.json();
        })
        .then(jsonResp => {
            endpoints = jsonResp['endpoints'] || [];
            imageSpaceElem = document.querySelector('#container');
            
            // let topSpaceElem = document.querySelector('#top-space');
            // let topObserver = new IntersectionObserver(
            //     topSpaceIntersectionObsCallBk,
            //     {
            //         root: null,
            //         rootMargin: '30%',
            //         threshold: 0,
            //     }
            // );
            // topObserver.observe(topSpaceElem);

            let footerElem = document.querySelector('#footer');
            let footerObserver = new IntersectionObserver(
                footerSpaceIntersectionObsCallBk,
                {
                    root: null,
                    rootMargin: '100%',
                    threshold: 0,
                }
            );
            footerObserver.observe(footerElem);
            createPlaceHoldersForNextBatch();
        })
        .catch(err => {
            console.log(err);
        });
});

function createPlaceHoldersForNextBatch() {
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < BATCH_SIZE; i++) {
        const imgEl = document.createElement('img');
        imgEl.setAttribute('data-index', i + LOADED_TILL_INDEX);
        imgEl.setAttribute('data-api', endpoints[i + LOADED_TILL_INDEX]);
        imgEl.setAttribute('src', './dummy.gif');
        imgEl.classList.add('thumb');
        let observer = new IntersectionObserver(intersectionObsCallBk, {
            root: imageSpaceElem,
            rootMargin: '100%',
            threshold: 0,
        });
        observer.observe(imgEl);
        fragment.appendChild(imgEl);
    }
    LOADED_TILL_INDEX = LOADED_TILL_INDEX + BATCH_SIZE;
    imageSpaceElem.appendChild(fragment);
}

function intersectionObsCallBk(entries, observer) {
    entries.forEach(entry => {
        let elem = entry.target;
        if (entry.isIntersecting) {
            const timeoutId = setTimeout(() => {
                const timeoutId = elem.getAttribute('data-timeoutid');
                if (timeoutId) {
                    const endpoint = elem.getAttribute('data-api');
                    fetch(endpoint)
                        .then(response => response.json())
                        .then(jsonResp => {
                            let { url: imageURL } = jsonResp;
                            //imageURL = "https://random.dog/ec3dd4d0-d666-44e8-bdcf-06b5f103b111.jpg";
                            if(imgUrlsCache.hasOwnProperty(imageURL)){
                                elem.classList.add("duplicateImg");
                            }else{
                                elem.setAttribute('src', imageURL);
                                elem.classList.add('loaded');
                                observer.disconnect();
                                elem.removeAttribute('data-timeoutid');
                                imgUrlsCache[imageURL]=true;
                            }
                        });
                }
            }, 200);
            elem.setAttribute('data-timeoutid', timeoutId);
        } else {
            elem.removeAttribute('data-timeoutid');
        }
    });
}

function footerSpaceIntersectionObsCallBk(entries, observer) {
    entries.forEach(entry => {
        let elem = entry.target;
        if (entry.isIntersecting) {
            createPlaceHoldersForNextBatch();
        } else {
        }
    });
}

function topSpaceIntersectionObsCallBk(entries, observer) {
    entries.forEach(entry => {
        let elem = entry.target;
        if (entry.isIntersecting) {
            createPlaceHoldersForNextBatch();
        } else {
        }
    });
}
