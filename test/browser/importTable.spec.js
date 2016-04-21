import expect from 'expect';
import { jsdom } from 'jsdom';
import { loadScripts, connect, makeCopyParams, uploadFile, deleteUploadedFile } from '../utils'; 
import { html, tableNameSync, tableNameAsync } from '../mocks';

const fileName = 'data.csv';
const filePath = './test/mocks/data.csv';
const scripts = loadScripts();

describe('#importTable', () => {
  it('should throw an error if not connected to a server', (done) => {
    const browserTest = (err, window) => {
      const con = new window.MapdCon();
      try {
        con.importTable(tableNameSync, fileName, makeCopyParams(window), () => { /* no-op */ });
      } catch (e) {
        expect(!!e).toEqual(true);
        done();
      }
    };
    jsdom.env({ html, src: scripts, done: browserTest });
  });

  xit('sync - should import a table', (done) => {
    const browserTest = (err, window) => {
      const con = connect(new window.MapdCon());
      const sessionId = con.sessionId()[0];
      uploadFile(sessionId, filePath, (uploadError, res) => {
        const tableName = con.importTable(tableNameSync, fileName, makeCopyParams(window));
        expect(tableName).toEqual(tableNameSync);
        deleteUploadedFile(sessionId, fileName, (deleteError, res) => {
          expect(res.statusCode).toBe(200);
          done();
        });
      });
    };
    jsdom.env({ html, src: scripts, done: browserTest });
  });

  it('async - should import a table', (done) => {
    const browserTest = (err, window) => {
      const con = connect(new window.MapdCon());
      const sessionId = con.sessionId()[0];
      uploadFile(sessionId, filePath, (uploadError, res) => {
        con.importTable(tableNameSync, fileName, makeCopyParams(window), () => {
          deleteUploadedFile(sessionId, fileName, (deleteError, res) => {
            expect(res.statusCode).toBe(200);
            done();
          });
        });
      });
    };
    jsdom.env({ html, src: scripts, done: browserTest });
  });
});




