import React, { useEffect, useRef, useState} from 'react';
import { isEqual, omit, functions } from 'lodash';
import { IconTooltip } from '../common/HelperComponents';
import classNames from 'classnames';

  Map.defaultProps = {
    options: {
      center: { lat: 48, lng: 8 },
      zoom: 5,
    },
  }

export function addMarker(map: ClimbcationMap,lat = -3.745,lng = -38.523,location,isSecondary, clickFunc: Function = null, setHoveredLocation): google.maps.Marker {
    const marker = new window.google.maps.Marker({
        map,
        position: {lat, lng},
        //details: {location: location}, 
        title: location.title || location.name,
        icon: isSecondary ? '' : 'https://s3-us-west-2.amazonaws.com/climbcation-front/assets/primary.png',
    });
    marker.addListener('mouseover', function(event) {
        var isInViewport = function (elem) {
            var bounding = elem.getBoundingClientRect();
            return (
                bounding.top >= 0 &&
                bounding.left >= 0 &&
                bounding.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
                bounding.right <= (window.innerWidth || document.documentElement.clientWidth)
            );
        };
        let point = map.overlay.getProjection().fromLatLngToContainerPixel(this.getPosition());
        //let point = map.overlay.getProjection().fromLatLngToContainerPixel(this.position);
        var offsetCalcY = 0;
        var offsetCalcX = 0;
        var bottomOffset = 0;
        let locationCard: HTMLElement = document.querySelector('.map-info-window > .location-card');
        if (map.getDiv().id === 'mapFilterLarge') {
            offsetCalcY = 50;
            offsetCalcX = 24;
            bottomOffset = 50;
        } else if (map.getDiv().id === 'mapFilter') {
            offsetCalcY = 45;
            offsetCalcX = -39;
            bottomOffset = 50;
        } else if (map.getDiv().id === 'nearby-map') {
            offsetCalcY = 60;
            offsetCalcX = 425;
            bottomOffset = 50;
            //$('.map-info-window > .location-card').addClass('left-arrow');
            locationCard.classList.add('left-arrow');
        }
        
        let mapInfoWindow: HTMLElement = document.querySelector('.map-info-window');
        //let infoWindowWidth = $('.map-info-window').outerWidth();
        //let infoWindowHeight = $('.map-info-window').outerHeight();
        let infoWindowWidth = 450;//mapInfoWindow.offsetWidth;
        let infoWindowHeight = 170;//mapInfoWindow.offsetHeight;

        //$('.map-info-window').show();
        mapInfoWindow.style.display = 'block';
        locationCard.classList.add('map-info-window-arrow-bottom');
        locationCard.classList.remove('map-info-window-arrow-top');
        mapInfoWindow.style.top = (point.y - infoWindowHeight - offsetCalcY) + 'px';
        mapInfoWindow.style.left = (point.x - infoWindowWidth - offsetCalcX) + 'px';
        //$('.map-info-window > .location-card').addClass('map-info-window-arrow-bottom');
        //$('.map-info-window > .location-card').removeClass('map-info-window-arrow-top');
        //$('.map-info-window').css('top', (point.y - infoWindowHeight - offsetCalcY) + 'px');
        //$('.map-info-window').css('left', (point.x - infoWindowWidth + offsetCalcX) + 'px');

        if (!isInViewport(mapInfoWindow)) {
            mapInfoWindow.style.top = (point.y - infoWindowHeight - offsetCalcY + (infoWindowHeight + bottomOffset)) + 'px'; 
            locationCard.classList.remove('map-info-window-arrow-bottom');
            locationCard.classList.add('map-info-window-arrow-top');
        }
        
        /*if (!$('.map-info-window').visible()) {
            $('.map-info-window').css('top', (point.y - infoWindowHeight - offsetCalcY + (infoWindowHeight + bottomOffset)) + 'px');
            $('.map-info-window > .location-card').removeClass('map-info-window-arrow-bottom');
            $('.map-info-window > .location-card').addClass('map-info-window-arrow-top');
        }*/
        setHoveredLocation(location);
    })
    marker.addListener('mouseout', (event) => {
        let mapInfoWindow: HTMLElement = document.querySelector('.map-info-window');
        mapInfoWindow.style.display = 'none';
    })
    if (clickFunc) {
        marker.addListener(`click`, (e) => {
            clickFunc(e);
        })
    }

    return marker;
}

function removeMarker(marker: google.maps.Marker) {
    google.maps.event.clearListeners(marker, 'mouseout');
    google.maps.event.clearListeners(marker, 'mouseover');
    google.maps.event.clearListeners(marker, 'click');

    marker.setMap(null);
}

class ClimbcationMap extends google.maps.Map {
    overlay: google.maps.OverlayView;
}

function Map({ options, markers, onMount, className, onMountProps, styles, onDragEnd, onZoomChange }) {
    const ref = useRef()
    const [map, setMap] = useState<ClimbcationMap>();
    let [pushedMarkers, setPushedMarkers] = useState<google.maps.Marker[]>([]);
    let [hoveredLocation, setHoveredLocation] = useState<any>(null);
    //let pushedMarkers: google.maps.Marker[] = [];

  
    useEffect(() => {
      const onLoad = () => {
            setMap(new ClimbcationMap(ref.current, options))
      }
        if (!window.google) {
            const script = document.createElement(`script`)
            script.src =
                `https://maps.googleapis.com/maps/api/js?key=AIzaSyAicaxhV5yGvMKxT06tgOlKDgrWUhzjjGE`
            document.head.append(script)
            script.addEventListener(`load`, onLoad)
            return () => script.removeEventListener(`load`, onLoad)
        } else {
            onLoad()
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (map) {
            let overlay = new google.maps.OverlayView();
            overlay.draw = function () {};
            overlay.setMap(map);
            map.overlay = overlay;
        }
        if (map && typeof onDragEnd === `function`) {
            map.addListener('dragend', () => onDragEnd(map));
        }
        if (map && typeof onZoomChange === `function`) {
            map.addListener('zoom_changed', () => onZoomChange(map));
        }
        return () => {
            map && google.maps.event.clearListeners(map, 'dragend');
            map && google.maps.event.clearListeners(map, 'zoom_changed');
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [map])

    useEffect(() => {
        // remove markers that are no longer used
        let removeMarkers = pushedMarkers.filter(marker => !markers.find(newMarker => newMarker.latitude === marker.getPosition().lat()))
        removeMarkers.forEach((marker) => {
            removeMarker(marker);
        });
        let newMarkerSet = pushedMarkers.filter(marker => markers.find(newMarker => newMarker.latitude === marker.getPosition().lat()))

        let markersToAdd = markers.filter(newMarker => !pushedMarkers.find(pushedMarker => pushedMarker.getPosition().lat() === newMarker.latitude));
        markersToAdd?.forEach(function(marker) {
            newMarkerSet.push(addMarker(map, marker.latitude, marker.longitude, marker, true, null, setHoveredLocation));
        })
        setPushedMarkers(newMarkerSet);
        
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [markers])
  
    if (map && typeof onMount === `function`) onMount(map, onMountProps)
  
    return (
        <>
        <div
            id="mapFilter"
            style={{ height: styles?.height || `210px`, width: styles?.width || '345px' }}
            {...{ ref, className }}
        />
        <div className="map-info-window " id="showMapInfoWindow" style={{display: "none"}}>
            <div className="location-card map-info-window-arrow-bottom">
                    <div className="location-card-info">
                        <div className="row">
                            <div className="col-md-8 location-list-thumb-container">
                                <a href={`/location/${ hoveredLocation?.location?.slug }}`}>
                                    <img className="location-list-thumb" src={hoveredLocation?.home_thumb} alt="location thumbnail" />	
                                    <div className="location-list-thumb-title">
                                        <h3 className="text-gray">{ hoveredLocation?.name }</h3>
                                    </div>
                                </a>

                            </div>
                            <div className="col-md-4 location-card-attributes">
                                <div className="col-xs-12 col-md-12">
                                    <label>Climbing Types</label>
                                    {hoveredLocation?.climbing_types?.map(type => (
                                        <img src={ type?.url } className='icon' title={ type?.name } alt={type?.name} key={type?.name} />
                                    ))}
                                </div>
                                <div className="col-xs-12 col-md-12">
                                    <label>Best Seasons</label>
                                    <p className="text-gray info-text">{ hoveredLocation?.date_range}</p>
                                </div>
                                <div className="col-xs-12 col-md-12">
                                    <label>Rating</label>
                                        <IconTooltip
                                                tooltip={hoveredLocation?.location?.rating === 1 ? 'Worth a stop' : (hoveredLocation?.location?.rating === 2 ? 'Worth a detour' : 'Worth its own trip')}
                                                dom={
                                                    <span>
                                                        <span className="glyphicon glyphicon-star" ></span>
                                                        <span className={classNames(["glyphicon glyphicon-star", {'glyphicon-star-empty': hoveredLocation?.location?.rating < 2}])}></span>
                                                        <span className={classNames(["glyphicon glyphicon-star", {'glyphicon-star-empty': hoveredLocation?.location?.rating < 3}])}></span>
                                                    </span>
                                                }
                                            />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
  }

function shouldNotUpdate(props, nextProps) {
    const [funcs, nextFuncs] = [functions(props), functions(nextProps)]
    const noPropChange = isEqual(JSON.stringify(omit(props, funcs )), JSON.stringify(omit(nextProps, nextFuncs)));
    //const noPropChange = isEqual(JSON.stringify(omit(props, funcs, 'markers')), JSON.stringify(omit(nextProps, nextFuncs, 'markers')));
    const noFuncChange =
      funcs.length === nextFuncs.length &&
      funcs.every(fn => props[fn].toString() === nextProps[fn].toString())
    return noPropChange && noFuncChange
}

export default React.memo(Map, shouldNotUpdate); 