import React, { Component } from 'react';
import threeShell from './threeShell';

export default class App extends Component {
//root elements are elements managed by react, a single DOM element
  componentDidMount() {
    document.title = "Lissitzky by office ca";
    threeShell(this.threeRootElement);
  }
  render() {
    return (
      <div>
        <div className='title'><h1>[CLICK AND DRAG] El Lissitzky—Suprematist space may be formed not only forward from the plane but also backward in depth. [PRESS SPACE] If we indicate the flat surface of the picture as 0, we can describe the direction in depth by – (negative) and the forward direction by+ (positive), or the other way round. We see that suprematism has swept away from the plane the illusions of two-dimensional planimetric space, the illusions of three-dimensional perspective space, and has created the ultimate illusion of irrational space, with its infinite extensibility into the background and foreground.</h1></div>
        <div ref={element => this.threeRootElement = element} />
      </div>
    );
  }
}
