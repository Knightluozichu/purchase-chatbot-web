const DEBUG = import.meta.env.MODE === 'development';

interface MessageDebugInfo {
  content: string;
  files?: File[];
  timestamp: string;
}

export const debug = {
  logMessage: (info: MessageDebugInfo) => {
    if (!DEBUG) return;

    console.group('Message Debug Info');
    console.log('Content:', info.content);
    console.log('Timestamp:', info.timestamp);
    
    if (info.files?.length) {
      console.group('Attached Files');
      info.files.forEach((file, index) => {
        console.log(`File ${index + 1}:`, {
          name: file.name,
          type: file.type,
          size: `${(file.size / 1024).toFixed(2)} KB`
        });
      });
      console.groupEnd();
    }
    
    console.groupEnd();
  },

  logAPIRequest: (endpoint: string, data: any) => {
    if (!DEBUG) return;
    
    console.group('API Request Debug');
    console.log('Endpoint:', endpoint);
    console.log('Payload:', data);
    console.groupEnd();
  }
};