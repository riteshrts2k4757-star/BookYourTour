const fetch = require('node-fetch').default;

const FLIGHT_CITY_CODES = {
  'new delhi': 'DEL', delhi: 'DEL', 'del': 'DEL',
  'mumbai': 'BOM', 'bombay': 'BOM',
  'bengaluru': 'BLR', 'bangalore': 'BLR',
  'goa': 'GOI', 'goa (dabolim)': 'GOI', 'goa (mopa)': 'GOX', 'mopa': 'GOX', 'dabolim': 'GOI',
  'kolkata': 'CCU', 'calcutta': 'CCU',
  'hyderabad': 'HYD',
  'chennai': 'MAA', 'madras': 'MAA',
  'kochi': 'COK', 'cochin': 'COK',
  'srinagar': 'SXR',
  'jaipur': 'JAI',
  'ahmedabad': 'AMD',
  'pune': 'PNQ',
  'lucknow': 'LKO',
  'patna': 'PAT',
  'guwahati': 'GAU',
  'bhubaneswar': 'BBI',
  'nagpur': 'NAG'
};

const normalizeAirportCode = (value) => {
  if (!value) return '';
  const candidate = String(value).trim();
  if (/^[A-Z]{3}$/i.test(candidate)) return candidate.toUpperCase();
  const compact = candidate.toLowerCase().replace(/[()]/g, '').replace(/\s+/g, ' ').trim();
  return FLIGHT_CITY_CODES[compact] || candidate.toUpperCase().slice(0, 3);
};

const normalizeTrainArray = (payload) => {
  const candidates = [];

  if (Array.isArray(payload)) {
    candidates.push(payload);
  } else if (payload && typeof payload === 'object') {
    candidates.push(
      payload.data,
      payload.trains,
      payload.results,
      payload.items,
      payload.searchResults,
      payload.train,
      payload.routes,
      payload.data?.trains,
      payload.data?.results,
      payload.data?.items
    );
  }

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate;
    }
  }

  return [];
};

const normalizeTrain = (item, index) => {
  const from = item?.from || item?.source || item?.origin || item?.departure || {};
  const to = item?.to || item?.destination || item?.arrival || item?.arrivalStation || {};

  const fromStation = from.station || from.name || from.city || from.code || 'Unavailable';
  const toStation = to.station || to.name || to.city || to.code || 'Unavailable';

  return {
    id: item?.id || item?._id || item?.trainNumber || item?.number || `qrail-${index}`,
    number: item?.trainNumber || item?.number || item?.train_no || item?.trainNo || 'Unavailable',
    name: item?.trainName || item?.name || item?.train || 'Unavailable',
    from: {
      station: fromStation,
      code: from.code || from.stationCode || from.shortCode || ''
    },
    to: {
      station: toStation,
      code: to.code || to.stationCode || to.shortCode || ''
    },
    departureTime: item?.departureTime || item?.departure || item?.startTime || 'Unavailable',
    arrivalTime: item?.arrivalTime || item?.arrival || item?.endTime || 'Unavailable',
    duration: item?.duration || item?.travelTime || item?.totalDuration || 'Unavailable',
    distance: item?.distance || item?.routeDistance || 'Unavailable',
    classes: Array.isArray(item?.classes)
      ? item.classes.map((cls, clsIndex) => ({
          id: cls?.id || `${item?.trainNumber || 'class'}-${clsIndex}`,
          type: cls?.type || cls?.className || 'General',
          name: cls?.name || cls?.className || 'Availability unavailable',
          fare: Number(cls?.fare || cls?.price || 0),
          available: cls?.available || cls?.availability || 'Unavailable'
        }))
      : [
          {
            id: `class-${index}`,
            type: 'General',
            name: 'Availability unavailable',
            fare: 0,
            available: 'Unavailable'
          }
        ],
    runningDays: Array.isArray(item?.runningDays)
      ? item.runningDays
      : Array.isArray(item?.days)
        ? item.days
        : ['Unavailable'],
    pantry: Boolean(item?.pantry || item?.meal || item?.food),
    status: item?.status || 'Unavailable'
  };
};

const buildQRailUrls = (baseUrl) => {
  const cleanedBaseUrl = (baseUrl || '').replace(/\/$/, '');

  const defaults = [
    `${cleanedBaseUrl}/api/v1/trains/search`,
    `${cleanedBaseUrl}/api/v1/rail/search`,
    `${cleanedBaseUrl}/api/trains/search`,
    `${cleanedBaseUrl}/api/v1/train/search`,
    `${cleanedBaseUrl}/api/v1/availability`,
    `${cleanedBaseUrl}/api/search`
  ];

  const fallbackBases = [
    'https://api.qrail.in',
    'https://api.qrail.io',
    'https://api.qrail.co',
    'https://api.qrail.tech'
  ];

  return Array.from(new Set([...defaults, ...fallbackBases.flatMap((url) => [
    `${url}/api/v1/trains/search`,
    `${url}/api/v1/rail/search`,
    `${url}/api/trains/search`,
    `${url}/api/search`
  ])]));
};

const extractTrainList = (payload) => {
  const raw = normalizeTrainArray(payload);
  return raw.map(normalizeTrain);
};

const normalizeFlight = (item, index) => {
  const departure = item?.departure || {};
  const arrival = item?.arrival || {};
  const airline = item?.airline || {};
  const flight = item?.flight || {};

  return {
    id: item?.flight?.iata || item?.flight?.icao || `${airline?.iata || 'air'}-${flight?.number || index}`,
    flightNumber: flight?.iata || `${airline?.iata || ''}${flight?.number || ''}` || `Flight ${index + 1}`,
    airline: airline?.name || 'Unknown airline',
    airlineCode: airline?.iata || 'N/A',
    from: {
      airport: departure?.airport || 'Unavailable',
      city: departure?.airport || 'Unavailable',
      code: departure?.iata || ''
    },
    to: {
      airport: arrival?.airport || 'Unavailable',
      city: arrival?.airport || 'Unavailable',
      code: arrival?.iata || ''
    },
    departureTime: departure?.estimated || departure?.scheduled || 'Unavailable',
    arrivalTime: arrival?.estimated || arrival?.scheduled || 'Unavailable',
    status: item?.flight_status || 'Unavailable',
    duration: item?.duration || 'Unavailable',
    travelClass: 'Economy',
    price: 0,
    available: item?.flight_status ? 'Real-time availability' : 'Unavailable'
  };
};

const extractFlightList = (payload) => {
  const data = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];
  return data.map(normalizeFlight);
};

exports.searchFlights = async (req, res) => {
  const { from, to, date } = req.query;

  if (!from || !to) {
    return res.status(400).json({
      status: 'fail',
      message: 'Both departure and destination airports or cities are required.'
    });
  }

  if (!process.env.AVIATIONSTACK_API_KEY) {
    return res.status(503).json({
      status: 'error',
      message: 'AviationStack API key is not configured on the backend. Add AVIATIONSTACK_API_KEY to backend/config.env.'
    });
  }

  const depCode = normalizeAirportCode(from);
  const arrCode = normalizeAirportCode(to);

  if (!depCode || !arrCode) {
    return res.status(400).json({
      status: 'fail',
      message: 'Unable to resolve the requested flight route to valid IATA airport codes.'
    });
  }

  const baseUrl = (process.env.AVIATIONSTACK_API_BASE_URL || 'https://api.aviationstack.com').replace(/\/$/, '');
  const buildRequestUrl = (includeDate) => {
    const url = new URL(`${baseUrl}/v1/flights`);
    url.searchParams.set('access_key', process.env.AVIATIONSTACK_API_KEY);
    url.searchParams.set('dep_iata', depCode);
    url.searchParams.set('arr_iata', arrCode);
    if (includeDate && date) url.searchParams.set('flight_date', String(date));
    return url.toString();
  };

  try {
    const urlsToTry = [buildRequestUrl(true), buildRequestUrl(false)];
    let lastPayload = null;
    let lastStatus = null;

    for (const requestUrl of Array.from(new Set(urlsToTry))) {
      const response = await fetch(requestUrl, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        }
      });

      const text = await response.text();
      let payload = null;
      try {
        payload = text ? JSON.parse(text) : null;
      } catch (_) {
        payload = { raw: text };
      }

      lastPayload = payload;
      lastStatus = response.status;

      if (response.ok) {
        const flights = extractFlightList(payload);
        return res.status(200).json({
          status: 'success',
          provider: 'AviationStack',
          data: {
            flights,
            message: flights.length > 0 ? 'Live AviationStack flight results retrieved successfully.' : 'AviationStack responded without flight data for this route.'
          }
        });
      }

      const errorMessage = payload?.error?.message || payload?.message || `HTTP ${response.status}`;
      if (requestUrl === buildRequestUrl(true) && String(response.status) === '403') {
        continue;
      }
      return res.status(response.status >= 500 ? 502 : 400).json({
        status: 'error',
        provider: 'AviationStack',
        message: 'AviationStack rejected the flight request.',
        details: errorMessage
      });
    }

    return res.status(lastStatus >= 500 ? 502 : 400).json({
      status: 'error',
      provider: 'AviationStack',
      message: 'AviationStack rejected the flight request.',
      details: lastPayload?.error?.message || lastPayload?.message || 'AviationStack returned an invalid response.'
    });
  } catch (error) {
    return res.status(502).json({
      status: 'error',
      provider: 'AviationStack',
      message: 'Unable to reach the AviationStack API or the route could not be resolved.',
      details: error?.message || 'Unknown AviationStack error.'
    });
  }
};

exports.searchTrains = async (req, res) => {
  const { from, to, date } = req.query;

  if (!from || !to) {
    return res.status(400).json({
      status: 'fail',
      message: 'Both source and destination are required.'
    });
  }

  if (!process.env.QRAIL_API_KEY) {
    return res.status(503).json({
      status: 'error',
      message: 'QRail API key is not configured on the backend. Add QRAIL_API_KEY to backend/config.env.'
    });
  }

  const baseUrls = buildQRailUrls(process.env.QRAIL_API_BASE_URL);
  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Authorization: `Bearer ${process.env.QRAIL_API_KEY}`,
    'x-api-key': process.env.QRAIL_API_KEY
  };

  let lastError = null;

  for (const candidateUrl of baseUrls) {
    for (const [method, requestBody] of [
      ['GET', null],
      ['POST', JSON.stringify({
        source: String(from),
        destination: String(to),
        from: String(from),
        to: String(to),
        date: String(date || new Date().toISOString().slice(0, 10)),
        journeyDate: String(date || new Date().toISOString().slice(0, 10))
      })]
    ]) {
      try {
        const url = new URL(candidateUrl);
        if (method === 'GET') {
          url.searchParams.set('from', String(from));
          url.searchParams.set('to', String(to));
          if (date) url.searchParams.set('date', String(date));
        }

        const response = await fetch(url.toString(), {
          method,
          headers: {
            ...headers,
            ...(method === 'POST' ? { 'Content-Type': 'application/json' } : {})
          },
          ...(requestBody ? { body: requestBody } : {})
        });

        const text = await response.text();
        let payload = null;

        try {
          payload = text ? JSON.parse(text) : null;
        } catch (_) {
          payload = { raw: text };
        }

        if (!response.ok) {
          lastError = payload?.message || payload?.error || `HTTP ${response.status}`;
          continue;
        }

        const trains = extractTrainList(payload);

        if (trains.length > 0) {
          return res.status(200).json({
            status: 'success',
            provider: 'QRail',
            data: {
              trains,
              message: 'Live QRail train results retrieved successfully.'
            }
          });
        }

        return res.status(200).json({
          status: 'success',
          provider: 'QRail',
          data: {
            trains: [],
            message: 'QRail API responded without train data for this route.'
          }
        });
      } catch (error) {
        lastError = error;
      }
    }
  }

  return res.status(502).json({
    status: 'error',
    provider: 'QRail',
    message: 'Unable to reach the QRail API or no compatible endpoint was found.',
    details: lastError?.message || 'Unknown QRail error.'
  });
};
