import { effects } from 'ferp/src/ferp';

//const TimerSub = (initialMilliseconds, action) => (dispatch) => {
  //console.log('TimerSub.start', initialMilliseconds);
  //let startTime = Date.now();
  //let handle = null;

  //const tick = () => {
    //const now = Date.now();
    //const milliseconds = Math.max(0, initialMilliseconds - (now - startTime));

    //setTimeout(() => {
      //dispatch(action.TickTimer(milliseconds));
    //}, 0);
    //if (milliseconds === 0) {
      //setTimeout(() => {
        //dispatch(action.DoneTimer());
      //}, 0);
      //return;
    //}

    //handle = setTimeout(tick, 100);
  //};

  //tick();

  //return () => {
    //console.log('TimerSub.stop');
    //clearTimeout(handle);
  //};
//};
//export const Timer = (...props) => [TimerSub, ...props];

export const Timer = (OnTime) => effects.delay(
  OnTime(),
  100
);
