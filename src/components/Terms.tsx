import React from 'react';
import {termsHtml, privacy} from '../common/tos';

function Terms() {
    return (
        <div className="container">
            <div className="row">
                <div className="col-6">
                    <div dangerouslySetInnerHTML={{__html: termsHtml}}></div>
                </div>
                <div className="col-6">
                    <div dangerouslySetInnerHTML={{__html: privacy}}></div>
                </div>
            </div>
        </div>
    );
}

export default Terms;