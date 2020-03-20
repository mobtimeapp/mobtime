export default (endpoint, token, timerId) => {
  const headers = {
    'Accept': 'application/json',
    'X-Timer-Id': timerId,
    Authorization: `token ${token}`,
  };
    
  return fetch(endpoint, { headers });
};
