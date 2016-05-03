import expect from 'expect';
import {
  connect,
  browserTest,
  makeCopyParams,
  uploadFile,
  deleteUploadedFile
} from '../utils/utils-transpiled';
import { tableNameSync, tableNameAsync } from '../mocks/mocks-transpiled';

const fileName = 'data.csv';
const filePath = './test/mocks/data.csv';

describe('#importTable', () => {
  it('should throw an error if not connected to a server',
    browserTest((done, window) => {
      const con = new window.MapdCon();
      try {
        con.importTable(tableNameSync, fileName, makeCopyParams(window), () => { /* no-op */ });
      } catch (e) {
        expect(!!e).toEqual(true);
        done();
      }
    })
  );

  xit('sync - should import a table',
    browserTest((done, window) => {
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
    })
  );

  it('async - should import a table',
    browserTest((done, window) => {
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
    })
  );
});
