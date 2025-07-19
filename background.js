function formatEventsForSheet(events) {
  const header = ['Title', 'Start', 'End'];
  const rows = events.map(event => [
    event.summary || '(No Title)',
    event.start?.dateTime || event.start?.date || '',
    event.end?.dateTime || event.end?.date || ''
  ]);
  return [header, ...rows];
}


function writeEventsToSheet(token, spreadsheetId, values, callback) {
  const range = 'Sheet1!A1';
  fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=RAW`, {
    method: 'PUT',
    headers: {
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ values })
  })
  .then(res => res.json())
  .then(data => {
    if (callback) callback(data);
  })
  .catch(err => {
    console.log('Error writing to spreadsheet:', err);
  });
}

function createSpreadsheet(token, title, callback) {
  fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ properties: { title: title } })
  })
  .then(response => response.json())
  .then(data => {
    if (data.spreadsheetId) {
      if (callback) callback(data);
    } else {
      console.log('Failed to create spreadsheet: ' + JSON.stringify(data));
    }
  })
  .catch(err => {
    console.log('Spreadsheet creation error: ' + err);
  });
}


chrome.identity.getAuthToken({ interactive: false }, function (token) {
  if (chrome.runtime.lastError || !token) {
    console.log('Authentication error: ' + chrome.runtime.lastError);
    return;
  }

  fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=2500', {
    headers: { 'Authorization': 'Bearer ' + token }
  })
  .then(response => response.json())
  .then(data => {
    if (data.items && data.items.length) {
      const formattedData = formatEventsForSheet(data.items);
      createSpreadsheet(token, "Daily Struggles", function(sheetData) {
        if (sheetData.spreadsheetId) {
          // Now add events to the sheet:
          writeEventsToSheet(token, sheetData.spreadsheetId, formattedData, function(writeResponse) {
            console.log('Events written to sheet:', writeResponse);
          });
        }
      });
    } else {
      console.log('No events found or API error.');
    }
  })
  .catch(error => {
    console.log('Fetch error: ' + error);
  });
});
