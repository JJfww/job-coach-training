/**
 * A small stand-in for the Apps Script services Code.js uses, so the real server code
 * runs in the tests and in the local preview page (dist/preview.html).
 * It has no delete methods on purpose: if Code.js ever tries to delete a row, it fails.
 *
 * store: { props: {}, books: { id: { sheets: [{ name, rows }] } } }
 * onChange: called after every write (the preview uses it to save to browser storage).
 */
function makeFakeGoogle(store, onChange) {
  const user = { active: '', effective: '' };
  const changed = () => { if (onChange) onChange(store); };

  function sheetApi(sheet) {
    const api = {
      getName: () => sheet.name,
      setName: (name) => { sheet.name = name; changed(); return api; },
      getLastRow: () => sheet.rows.length,
      appendRow: (row) => {
        // Sheets stores a leading apostrophe as "this is text" and does not keep it.
        sheet.rows.push(row.map((value) => (typeof value === 'string' && value.startsWith("'") ? value.slice(1) : value)));
        changed();
        return api;
      },
      setFrozenRows: () => api,
      getDataRange: () => ({ getValues: () => sheet.rows.map((row) => row.slice()) }),
      getRange: (row, column) => ({
        setFontWeight: () => api,
        setValue: (value) => { sheet.rows[row - 1][column - 1] = value; changed(); },
      }),
    };
    return api;
  }

  function bookApi(id) {
    const book = store.books[id];
    return {
      getId: () => id,
      getSheets: () => book.sheets.map(sheetApi),
      getSheetByName: (name) => {
        const sheet = book.sheets.find((entry) => entry.name === name);
        return sheet ? sheetApi(sheet) : null;
      },
      insertSheet: (name) => {
        const sheet = { name, rows: [] };
        book.sheets.push(sheet);
        changed();
        return sheetApi(sheet);
      },
    };
  }

  return {
    setUser(active, effective) {
      user.active = active;
      if (effective) user.effective = effective;
    },
    globals: {
      PropertiesService: {
        getScriptProperties: () => ({
          getProperty: (key) => (key in store.props ? store.props[key] : null),
          setProperty: (key, value) => { store.props[key] = value; changed(); },
        }),
      },
      SpreadsheetApp: {
        create: () => {
          const id = `sheet-${Object.keys(store.books).length + 1}`;
          store.books[id] = { sheets: [{ name: 'Sheet1', rows: [] }] };
          changed();
          return bookApi(id);
        },
        openById: (id) => {
          if (!store.books[id]) throw new Error(`No spreadsheet ${id}`);
          return bookApi(id);
        },
      },
      Session: {
        getActiveUser: () => ({ getEmail: () => user.active }),
        getEffectiveUser: () => ({ getEmail: () => user.effective }),
      },
      LockService: {
        getScriptLock: () => ({ waitLock: () => {}, releaseLock: () => {} }),
      },
    },
  };
}

if (typeof module !== 'undefined') module.exports = { makeFakeGoogle };
