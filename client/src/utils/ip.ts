export const getClientPublicIp = async (): Promise<string | null> => {
  try {
    // Try multiple services for reliability
    const services = [
      'https://api.ipify.org?format=json',
      'https://api64.ipify.org?format=json',
      'https://ipapi.co/json/',
    ];

    for (const service of services) {
      try {
        const response = await fetch(service, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
        });

        if (response.ok) {
          const data = await response.json();
          // Different services return IP in different formats
          const ip = data.ip || data.query || data.origin;
          if (ip && typeof ip === 'string') {
            return ip;
          }
        }
      } catch {
        // Try next service
        continue;
      }
    }

    return null;
  } catch {
    return null;
  }
};
