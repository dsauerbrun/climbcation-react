/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState} from 'react';
import { isEqual, omit, functions } from 'lodash';
import { IconTooltip } from '../common/HelperComponents';
import classNames from 'classnames';
import Location from '../classes/Location';
import {Link} from 'react-router-dom';

  Map.defaultProps = {
    options: {
      center: { lat: 48, lng: 8 },
      zoom: 5,
    },
  }

export function addMarker(map: ClimbcationMap,lat = -3.745,lng = -38.523,location,isSecondary, clickFunc: Function = null, setTooltipLocation, mapName): google.maps.Marker {
    const marker = new window.google.maps.Marker({
        map,
        position: {lat, lng},
        title: location.title || location.name,
        icon: isSecondary ? 'https://s3-us-west-2.amazonaws.com/climbcation-front/assets/primary.png': '',
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
        setTooltipLocation(new Location(location));
        let point = map.overlay.getProjection().fromLatLngToContainerPixel(this.getPosition());
        var offsetCalcY = 0;
        var offsetCalcX = 0;
        var bottomOffset = 0;
        let locationCard: HTMLElement = document.querySelector('.map-info-window > .location-card');
        if (mapName === 'mapFilterLarge') {
            offsetCalcY = -640;
            offsetCalcX = -606;
            offsetCalcX = -35;
            bottomOffset = 50;
        } else if (mapName === 'mapFilter') {
            offsetCalcY = 15;
            offsetCalcX = -9;
            bottomOffset = 50;
        } else if (mapName === 'nearby-map') {
            offsetCalcY = 45;
            offsetCalcX = -387;
            bottomOffset = 50;
            locationCard.classList.add('left-arrow');
        }
        
        let mapDiv: HTMLElement = document.querySelector(`#${mapName}`);
        let mapWidth = mapDiv.offsetWidth;
        let mapInfoWindow: HTMLElement = document.querySelector('.map-info-window');
        mapInfoWindow.style.display = 'block';
        let infoWindowHeight = mapInfoWindow.offsetHeight;

        locationCard.classList.add('map-info-window-arrow-bottom');
        locationCard.classList.remove('map-info-window-arrow-top');
        mapInfoWindow.style.top = (point.y - infoWindowHeight - offsetCalcY) + 'px';
        mapInfoWindow.style.right = (mapWidth - point.x + offsetCalcX) + 'px';

        if (!isInViewport(mapInfoWindow)) {
            mapInfoWindow.style.top = (point.y - infoWindowHeight - offsetCalcY + (infoWindowHeight + bottomOffset)) + 'px'; 
            locationCard.classList.remove('map-info-window-arrow-bottom');
            locationCard.classList.add('map-info-window-arrow-top');
        }
    })
    marker.addListener('mouseout', (event) => {
        let mapInfoWindow: HTMLElement = document.querySelector('.map-info-window');
        mapInfoWindow.style.display = 'none';
    })
    if (clickFunc) {
        marker.addListener(`click`, (e) => {
            clickFunc(location);
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
    getLatitude: number;
    getLongitude: number;
}

function Map({ options, latitude, longitude, zoom, markers, onMount, className, onMountProps, styles, onDragEnd, onZoomChange, markerClickFunc, hoveredLocation}) {
    const ref = useRef()
    const [map, setMap] = useState<ClimbcationMap>();
    const [mapId, setMapId] = useState<string>(options.id || 'mapFilter');
    let [pushedMarkers, setPushedMarkers] = useState<google.maps.Marker[]>([]);
    let [tooltipLocation, setTooltipLocation] = useState<Location>(null);
  
    useEffect(() => {
        setMapId(options.id);
        const onLoad = () => {
            setMap(new ClimbcationMap(ref.current, options));
            refreshMarkers();
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
            map.getLatitude = latitude;
            map.getLongitude = longitude;
            let currentLat = map.getCenter().lat();
            if (currentLat === latitude) {
            } else {
                google.maps.event.clearListeners(map, 'zoom_changed');
                map.setZoom(zoom);
                map.setCenter(new google.maps.LatLng(latitude || 0, longitude || 0));
                map.addListener('zoom_changed', () => onZoomChange(map));
            }
        }
    }, [latitude])

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

    let refreshMarkers = () => {
        if (map) {
            // remove markers that are no longer used
            let removeMarkers = pushedMarkers.filter(marker => !markers.find(newMarker => newMarker.latitude === marker.getPosition().lat()))
            removeMarkers.forEach((marker) => {
                removeMarker(marker);
            });
            let newMarkerSet = pushedMarkers.filter(marker => markers.find(newMarker => newMarker.latitude === marker.getPosition().lat()))

            let markersToAdd = markers.filter(newMarker => !pushedMarkers.find(pushedMarker => pushedMarker.getPosition().lat() === newMarker.latitude));
            markersToAdd?.forEach(function(marker) {
                newMarkerSet.push(addMarker(map, marker.latitude, marker.longitude, marker, marker.isPrimary ? true : false, markerClickFunc, setTooltipLocation, options.id));
            })
            setPushedMarkers(newMarkerSet);
        }
    }
    useEffect(() => {
        refreshMarkers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [map])

    useEffect(() => {
        refreshMarkers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [markers])

    useEffect(() => {
        let primaryUrl = 'https://s3-us-west-2.amazonaws.com/climbcation-front/assets/primary.png';
        pushedMarkers.forEach(marker => {
            if (marker.getPosition().lat() === hoveredLocation?.latitude) {
                marker.setIcon(primaryUrl);
                marker.setZIndex(19999999999);
            } else {
                if (marker.getIcon() === primaryUrl) {
                    marker.setIcon('');
                    marker.setZIndex(1)
                }
            }
        });
    }, [hoveredLocation])
  
    if (map && typeof onMount === `function`) onMount(map, onMountProps)
  
    return (
        <>
        <div
            id={mapId}
            style={{ height: styles?.height || `210px`, width: styles?.width || '345px' }}
            {...{ ref, className }}
        />
        <div className="map-info-window" id="showMapInfoWindow" style={{display: 'none'}}>
            <div className="location-card map-info-window-arrow-bottom">
                    <div className="location-card-info">
                        <div className="row">
                            <div className="col-md-8 location-list-thumb-container">
                                <Link to={`/location/${ tooltipLocation?.slug }}`}>
                                    <img className="location-list-thumb" src={tooltipLocation?.home_thumb} alt="location thumbnail" />	
                                    <div className="location-list-thumb-title">
                                        <h3 className="text-gray">{ tooltipLocation?.name }</h3>
                                    </div>
                                </Link>

                            </div>
                            <div className="col-md-4 location-card-attributes">
                                <div className="col-xs-12 col-md-12">
                                    <label>Climbing Types</label>
                                    {tooltipLocation?.climbing_types?.map(type => (
                                        <img src={ type?.url } className='icon' title={ type?.name } alt={type?.name} key={type?.name} />
                                    ))}
                                </div>
                                <div className="col-xs-12 col-md-12">
                                    <label>Best Seasons</label>
                                    <p className="text-gray info-text">{ tooltipLocation?.date_range}</p>
                                </div>
                                <div className="col-xs-12 col-md-12">
                                    <label>Rating</label>
                                        <IconTooltip
                                                tooltip={tooltipLocation?.rating === 1 ? 'Worth a stop' : (hoveredLocation?.rating === 2 ? 'Worth a detour' : 'Worth its own trip')}
                                                dom={
                                                    <span>
                                                        <span className="glyphicon glyphicon-star" ></span>
                                                        <span className={classNames(["glyphicon glyphicon-star", {'glyphicon-star-empty': tooltipLocation?.rating < 2}])}></span>
                                                        <span className={classNames(["glyphicon glyphicon-star", {'glyphicon-star-empty': tooltipLocation?.rating < 3}])}></span>
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
    const noPropChange = isEqual(JSON.stringify(omit(props, funcs, 'hoveredLocation', 'options', 'latitude', 'longitude', 'zoom' )), JSON.stringify(omit(nextProps, nextFuncs, 'hoveredLocation', 'options', 'latitude', 'longitude', 'zoom')));
    const noFuncChange =
      funcs.length === nextFuncs.length &&
      funcs.every(fn => props[fn].toString() === nextProps[fn].toString());
    let presetLatitudes = [-3.745, 55.875310835696816, 46.80005944678737]
    let presetFilterClicked = presetLatitudes.includes(nextProps.latitude)
    
    return noPropChange && noFuncChange && !presetFilterClicked;
}

export default React.memo(Map, shouldNotUpdate); 