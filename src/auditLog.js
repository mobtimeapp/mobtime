import { effects } from 'ferp';
import { database } from './database';

const writeToAuditLog = (
  timer_id, // eslint-disable-line camelcase
  token,
  action,
  parameters,
) => database
  .table('audit')
  .insert({
    timer_id, // eslint-disable-line camelcase
    token,
    action,
    parameters,
    created_at: new Date(),
    updated_at: new Date(),
  });

const parametersToString = (parameters) => {
  if (!parameters) return null;
  return (typeof parameters === 'object')
    ? JSON.stringify(parameters)
    : parameters.toString();
};

export default (
  timer_id, // eslint-disable-line camelcase
  token,
  action,
  parameters,
) => effects.defer(
  writeToAuditLog(
    timer_id, // eslint-disable-line camelcase
    token,
    action,
    parametersToString(parameters),
  )
    .catch((error) => {
      console.log('Unable to write to audit log', error); // eslint-disable-line no-console
    })
    .then(() => effects.none()),
);
