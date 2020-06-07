import {Tooltip, OverlayTrigger} from 'react-bootstrap';
import React, { useRef, useEffect } from 'react';

export function IconTooltip(props: any) {
    return (
        <OverlayTrigger
            placement="top"
            delay={{ show: 250, hide: 400 }}
            overlay={renderTooltip({tooltip: props.tooltip})}
        >
            {props.dom}
        </OverlayTrigger>
    );
}

function renderTooltip(props: any) {
    return (
        <Tooltip id="button-tooltip" {...props}>
            <div style={{fontSize: '12px'}}>{props.tooltip}</div>
        </Tooltip>
    );
}

export function usePrevious(value) {
    const ref = useRef();
    useEffect(() => {
      ref.current = value;
    });
    return ref.current;
 }