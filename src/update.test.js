import test from 'ava';
import {update} from './update';
import Action from './actions';
import {effects} from "ferp";

test('can initialize state', (t) => {
    const [state, effect] = update(Action.Init(), undefined);
    t.deepEqual(state, {connections: []});
    t.deepEqual(effect, effects.none());
})

test('can add a new connection', (t) => {
    const [state, effect] = update(Action.AddConnection(), {connections: []});
    // state.AddConnection({ websocket: 'data', timerId: 'stuff', isOwner: 'foobar' });
    // t.is(state.connections.size, 1)
})
