import React from 'react';

export default class LeftArea extends React.Component {
  state = {
    jsp: this.props.jsp,
    dragInitialized: false
  }

  componentDidMount() {
    this.init();
  }

  init = () => {
    // console.log('init');
    this.state.jsp.draggable([this.refs.square, this.refs.circle, this.refs.rect], {
      clone: true,
      drag: params => {
        this.props.updatepos( params.pos );
      }
    })
  }
  render() {
    return (
      <div className="left-area">
        <div className="item">
          <div className="square center" ref="square">Start</div>
        </div>
        <div className="item">
                <div className="circle center" ref="circle">process</div>
        </div>
        <div className="item">
                <div className="rect center" ref="rect">End</div>
        </div>
      </div>
    );
  }
}

