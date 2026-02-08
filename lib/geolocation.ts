// lib/geolocation.ts

export async function getLocationFromIP(ip: string) {
  // localhost는 위치 확인 불가
  if (ip === 'localhost' || ip === '127.0.0.1' || ip === '::1') {
    return {
      country: 'Local',
      city: 'Localhost',
      region: 'Dev',
      latitude: 0,
      longitude: 0,
    };
  }
  
  try {
    // ipapi.co 사용 (무료 1,000/day)
    const response = await fetch(`https://ipapi.co/${ip}/json/`, {
      headers: {
        'User-Agent': 'sharklink/1.0',
      },
    });
    
    if (!response.ok) {
      throw new Error('IP API failed');
    }
    
    const data = await response.json();
    
    // 에러 응답 체크
    if (data.error) {
      console.warn('IP API error:', data.reason);
      return getDefaultLocation();
    }
    
    return {
      country: data.country_name || 'Unknown',
      city: data.city || 'Unknown',
      region: data.region || 'Unknown',
      latitude: data.latitude || 0,
      longitude: data.longitude || 0,
    };
  } catch (error) {
    console.error('Geolocation error:', error);
    return getDefaultLocation();
  }
}

function getDefaultLocation() {
  return {
    country: 'Unknown',
    city: 'Unknown',
    region: 'Unknown',
    latitude: 0,
    longitude: 0,
  };
}
