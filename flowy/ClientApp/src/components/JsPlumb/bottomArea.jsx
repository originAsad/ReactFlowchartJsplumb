import React from 'react';

export default function BottomArea(props){
    return (
      <div className="bottom-area">
    The submitted data is:
        <div className="data-wrap">
          {JSON.stringify(props.datas || '')}
        </div>
      </div>
    );
}

