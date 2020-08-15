import { app } from 'ferp';
import * as storage from './storage';
import Action from './actions';
import { Http } from './http';
import { Websocket } from './websocket';
import { update } from './update';

const port = process.env.PORT || 1234;

const Storage = storage.make();

app({
  init: update(Action.Init(), undefined),

  update,

  subscribe: state => {
    Storage.store(state);

    return [
      Http(Storage, Action, 'localhost', port),
      ...state.connections.map((connection) => (
        Websocket(Action, connection)
      )),
    ];
  },
});
