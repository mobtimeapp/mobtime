import {effects} from 'ferp';
import Action from './actions';

export const update = (action, state) => {
    if (!action) return [state, effects.none()];

    return Action.caseOf({
        Init: () => [
            {
                connections: [],
            },
            effects.none(),
        ],

        AddConnection: (websocket, timerId, isOwner) => {
            return [
                {
                    ...state,
                    connections: state.connections.concat({
                        websocket,
                        timerId,
                        isOwner
                    })
                },
                effects.none(),
            ]
        },

        RemoveConnection: (websocket) => {
            return [
                {
                    ...state,
                    connections: state.connections.filter(connection => websocket !== connection.websocket)
                }
            ]
        }

    }, action);

};
