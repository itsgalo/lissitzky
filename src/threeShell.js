import SceneManager from './SceneManager';
//this exports a default container for the canvas for react
export default container => {

  const canvas = createCanvas(document, container);
  const sceneManager = new SceneManager(canvas);
  let pointTest = [0,0];

  bindEventListeners();
  render();

  function createCanvas(document, container) {
    //builds the DOM container
    const canvas = document.createElement('canvas');
    container.appendChild(canvas);
    return canvas;
  }

  function bindEventListeners() {

    window.onresize = resizeCanvas;
    window.onmousedown = mDown;
    window.onmousemove = mMove;
    window.onmouseup = mUp;
    window.onkeypress = keyP;
    canvas.ontouchstart = touchS;
    canvas.ontouchend = touchUp;
    canvas.ontouchmove = touchM;
    resizeCanvas();
  }

  function resizeCanvas() {

    canvas.style.width = '100%';
    canvas.style.height = '100%';

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    sceneManager.onWindowResize();
  }

  function mDown(e) {
    e.preventDefault();
    sceneManager.onDown(e.clientX, e.clientY);
    pointTest[0] = e.clientX;
    pointTest[1] = e.clientY;
    return false;
  }

  function mUp(e) {
    if (e.clientX !== pointTest[0] && e.clientY !== pointTest[1]) {
      sceneManager.onUp();
    }
  }

  function mMove(e) {
    e.preventDefault();
    sceneManager.onMove(e.clientX, e.clientY);
    return false;
  }

  function keyP(e) {
    sceneManager.onKey();
  }

  function touchS(e) {
    sceneManager.onDown(e.targetTouches[0].pageX, e.targetTouches[0].pageY);
  }

  function touchM(e) {
    sceneManager.onMove(e.targetTouches[0].pageX, e.targetTouches[0].pageY);
  }

  function touchUp(e) {
    sceneManager.onUp();
  }

  function render(time) {

    requestAnimationFrame(render);
    sceneManager.update();
  }
}
