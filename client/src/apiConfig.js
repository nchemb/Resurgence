/*export const getApiBaseUrl = () => {
    if (window.location.hostname === 'localhost') {
      return 'http://localhost:3001'; // Your backend API when accessed from localhost
    } else {
      return `http://${window.location.hostname}:3001`; // Your backend API when accessed from other devices
    }
  };*/

  export const getApiBaseUrl = () => {
    const hostname = window.location.hostname;
  
    if (hostname.endsWith('localhost')) {
      // Append port for localhost (including subdomains)
      return `http://${hostname}:3001`;
    } else {
      // For production or other cases
      return `http://${hostname}`;
    }
  };
  

  
  