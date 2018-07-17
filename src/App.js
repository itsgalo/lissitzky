import React, { Component } from 'react';
import threeShell from './threeShell';

export default class App extends Component {
//root elements are elements managed by react, a single DOM element
  componentDidMount() {
    document.title = "Lissitzky";
    threeShell(this.threeRootElement);
  }
  render() {
    return (
      <div>
        <div className='title'><a href=''>lissitzky.xyz</a></div>
        <div ref={element => this.threeRootElement = element} />
      </div>
    );
  }
}
