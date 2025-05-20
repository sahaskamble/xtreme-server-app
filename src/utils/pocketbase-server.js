// Import Neutralino libraries with error handling
let os, app, events, filesystem;
try {
  const neutralino = import.meta.env.DEV ? await import('@neutralinojs/lib') : null;
  if (neutralino) {
    os = neutralino.os;
    app = neutralino.app;
    events = neutralino.events;
    filesystem = neutralino.filesystem;
  }
} catch (error) {
  console.warn('Neutralino libraries not available:', error.message);
}

// Configuration for PocketBase
const POCKETBASE_CONFIG = {
  // Binary name for Windows
  windowsBinary: 'pocketbase.exe',
  // Default port
  port: 8090,
  // Default data directory
  dataDir: 'pb_data',
  // Process ID storage key
  pidStorageKey: 'pocketbase_pid'
};

/**
 * Start the PocketBase server as a background process
 * @returns {Promise<number|null>} Process ID or null if failed
 */
export async function startPocketBaseServer() {
  // Check if Neutralino libraries are available
  if (!os || !app || !filesystem) {
    console.warn('Neutralino libraries not available, cannot start PocketBase server');
    return null;
  }

  try {
    // Get the application directory
    const appPath = await app.getPath();
    console.log('App path:', appPath);

    // Check if we're running on Windows
    const osInfo = await os.getOSInfo();
    if (osInfo.name !== 'Windows') {
      console.error('This function is designed for Windows only');
      return null;
    }

    // Construct the path to the PocketBase binary
    const pocketbasePath = `${appPath}\\resources\\${POCKETBASE_CONFIG.windowsBinary}`;
    console.log('PocketBase path:', pocketbasePath);

    // Check if the binary exists
    try {
      await filesystem.getStats(pocketbasePath);
    } catch (error) {
      console.error('PocketBase binary not found at:', pocketbasePath);
      return null;
    }

    // Create data directory if it doesn't exist
    const dataDir = `${appPath}\\resources\\${POCKETBASE_CONFIG.dataDir}`;
    try {
      await filesystem.getStats(dataDir);
    } catch (error) {
      // Directory doesn't exist, create it
      await filesystem.createDirectory(dataDir);
      console.log('Created data directory:', dataDir);
    }

    // Command to start PocketBase
    // Using --dir flag to specify the data directory
    const command = `"${pocketbasePath}" serve --http="127.0.0.1:${POCKETBASE_CONFIG.port}" --dir="${dataDir}"`;
    console.log('Starting PocketBase with command:', command);

    // Execute the command as a background process
    const process = await os.execCommand(command, {
      background: true
    });

    console.log('PocketBase started with PID:', process.pid);

    // Store the process ID for later use
    await app.setGlobalProperty(POCKETBASE_CONFIG.pidStorageKey, process.pid);

    // Register app exit handler to kill PocketBase when the app exits
    if (events) {
      events.on('appExit', () => {
        stopPocketBaseServer().catch(console.error);
      });
    }

    return process.pid;
  } catch (error) {
    console.error('Failed to start PocketBase server:', error);
    return null;
  }
}

/**
 * Stop the PocketBase server
 * @returns {Promise<boolean>} True if successful, false otherwise
 */
export async function stopPocketBaseServer() {
  try {
    // Get the stored process ID
    const pid = await app.getGlobalProperty(POCKETBASE_CONFIG.pidStorageKey);
    if (!pid) {
      console.log('No PocketBase process ID found');
      return false;
    }

    console.log('Stopping PocketBase with PID:', pid);

    // On Windows, we need to use taskkill to terminate the process
    await os.execCommand(`taskkill /F /PID ${pid}`, {
      background: true
    });

    // Clear the stored process ID
    await app.setGlobalProperty(POCKETBASE_CONFIG.pidStorageKey, null);

    console.log('PocketBase server stopped');
    return true;
  } catch (error) {
    console.error('Failed to stop PocketBase server:', error);
    return false;
  }
}

/**
 * Check if the PocketBase server is running
 * @returns {Promise<boolean>} True if running, false otherwise
 */
export async function isPocketBaseServerRunning() {
  try {
    // Get the stored process ID
    const pid = await app.getGlobalProperty(POCKETBASE_CONFIG.pidStorageKey);
    if (!pid) {
      return false;
    }

    // On Windows, we can use tasklist to check if the process is running
    const result = await os.execCommand(`tasklist /FI "PID eq ${pid}" /NH`);



    // If the output contains the PID, the process is running
    return result.stdOut.includes(pid.toString());
  } catch (error) {
    console.error('Failed to check if PocketBase server is running:', error);
    return false;
  }
}

/**
 * Get the URL of the PocketBase server
 * @returns {string} URL of the PocketBase server
 */
export function getPocketBaseUrl() {
  return `http://127.0.0.1:${POCKETBASE_CONFIG.port}`;
}
