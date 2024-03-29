const clickListener = function (ev) {
    ev.stopPropagation();
    ev.preventDefault();

    const name = ev.target.getAttribute('name');
    const el = ev.detail.intersection && ev.detail.intersection.object.el;

    if (el && el === ev.target) {
        // after click, we are adding a label with the name of the place
        const label = document.createElement('span');
        const container = document.createElement('div');
        container.setAttribute('id', 'place-label');
        label.innerText = name;
        container.appendChild(label);
        document.body.appendChild(container);

        setTimeout(() => {
            // that will disappear after less than 2 seconds
            container.parentElement.removeChild(container);
        }, 1500);
     }
 };


// getting places from APIs
function loadPlaces(position) {
    const params = {
        radius: 100,    // search places not farther than this value (in meters)
        clientId: 'NJMQWFFXGZTHNCNV5ORT4I3XP0EMOQAEPTNFP0IDCKUPOUQY',
        clientSecret: 'XK3E4NH0Z3TZBZDKAZAOSJGLV0EYVWOQNMINS3PHY4JWGFNB',
        version: '20300101',    // foursquare versioning, required but unuseful for this demo
    };

    // CORS Proxy to avoid CORS problems
    const corsProxy = 'https://cors-anywhere.herokuapp.com/';

    // Foursquare API (limit param: number of maximum places to fetch)
    const endpoint = `${corsProxy}https://api.foursquare.com/v2/venues/search?intent=checkin
        &ll=${position.latitude},${position.longitude}
        &radius=${params.radius}
        &client_id=${params.clientId}
        &client_secret=${params.clientSecret}
        &limit=30 
        &v=${params.version}`;
    return fetch(endpoint)
        .then((res) => {
            return res.json()
                .then((resp) => {
                    return resp.response.venues;
                })
        })
        .catch((err) => {
            console.error('Error with places API', err);
        })
};


window.onload = () => {
    const scene = document.querySelector('a-scene');

    // first get current user location
    return navigator.geolocation.getCurrentPosition(function (position) {

        // than use it to load from remote APIs some places nearby
        loadPlaces(position.coords)
            .then((places) => {
                places.forEach((place) => {
                    const latitude = place.location.lat;
                    const longitude = place.location.lng;

                    // add place name
                    const placeText = document.createElement('a-link');
                    placeText.setAttribute('gps-entity-place', `latitude: ${latitude}; longitude: ${longitude};`);
                    placeText.setAttribute('title', place.name);
                    placeText.setAttribute('scale', '15 15 15');
                    
                    placeText.addEventListener('loaded', () => {
                        window.dispatchEvent(new CustomEvent('gps-entity-place-loaded'))
                    });

                    scene.appendChild(placeText);
                });
            })
    },
        (err) => console.error('Error in retrieving position', err),
        {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 27000,
        }
    );
};
