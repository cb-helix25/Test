// Azure Function Configuration Template
// Copy this file to azureConfig.ts and update with your actual values

// Configuration interface for Azure Function authentication
export interface AzureFunctionConfig {
  endpoint: string;
  functionKey?: string; // Function-level key
  hostKey?: string;     // Host-level key  
  clientId?: string;    // For AAD authentication
  authToken?: string;   // Bearer token
}

// Configuration object - update these values with your actual Azure Function details
export const AZURE_CONFIG: AzureFunctionConfig = {
  endpoint: 'https://your-function-app.azurewebsites.net/api/your-endpoint',
  functionKey: 'your-function-key-here',
  // hostKey: 'your-host-key-here',        // Alternative authentication method
  // clientId: 'your-client-id-here',      // For Azure AD authentication
  // authToken: 'your-bearer-token-here'   // For Bearer token authentication
};