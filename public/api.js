export default (endpoint, token) => {
  const headers = {
    'Accept': 'application/json',
    Authorization: `token ${token}`,
  };
    
  return fetch(endpoint, { headers });
};
