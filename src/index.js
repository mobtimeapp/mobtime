import {app, effects} from 'ferp';
import * as bus from './bus';
import * as storage from './storage';
import Action from './actions';
import {Http} from './http';
import {update} from './update';

const port = process.env.PORT || 4321;

const MessageBus = bus.make();
const Storage = storage.make();



app({
    init: update(Action.Init(), {}),

    update,

    subscribe: state => {
        Storage.store(state);

        return [
            Http(
                MessageBus,
                Storage,
                Action,
                'localhost',
                port,
            ),
        ];
    },
});
