import PocketBase from 'pocketbase';
import { PB_URL } from '../constant/url';
// import { getPocketBaseUrl } from '../../utils/pocketbase-server';

// Create PocketBase client with the URL from our server utility
const pb = new PocketBase(PB_URL);

// Disable auto-cancellation for better control over requests
pb.autoCancellation(false);

// Log authentication changes
pb.authStore.onChange((e) => {
  console.log('Auth state changed - isValid:', pb.authStore.isValid);
  console.log('Auth event:', e);
});

export default pb;
