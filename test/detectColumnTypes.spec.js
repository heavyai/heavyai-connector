// NPM Dependencies
import expect from 'expect';
import { jsdom } from 'jsdom';

// Custom Dependences
import { connect, loadScripts, uploadFile, deleteUploadedFile } from './utils';
import { html } from './mocks';

// JSDom Configuration
const scripts = loadScripts();

const fileName = 'data.csv';
const filePath = './test/mocks/' + fileName;

describe('#detectColumnTypes', () => {
  it('should pass a TDetectResult with the data to the callback', (done) => {
    const test = (err, window) => {
      const mapdcon = connect(new window.MapdCon());
      const sessionId = mapdcon.sessionId()[0];
      uploadFile(sessionId, filePath, () => {
        const copyParams = new window.TCopyParams();
        copyParams.delimiter = '';
        copyParams.quoted = false;
        copyParams.null_str = 'null';
        mapdcon.detectColumnTypes(fileName, copyParams, (tableData) => {
          const columnHeaders = tableData.row_set.row_desc;
          const rows = tableData.row_set.rows;
          expect(tableData instanceof window.TDetectResult).toBe(true);
          expect(Array.isArray(columnHeaders)).toBe(true);
          expect(columnHeaders.length).toBe(17);
          expect(rows.length).toBe(11);
          deleteUploadedFile(sessionId, fileName, () => {
            done();
          });
        });
      });
    };
    jsdom.env({ html, src: scripts, done: test });
  });
});
