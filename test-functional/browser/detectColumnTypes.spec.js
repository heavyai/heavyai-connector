import expect from 'expect';
import { connect, browserTest, uploadFile, deleteUploadedFile, makeCopyParams } from '../utils/utils-transpiled';

const filePath = './test/mocks/data.csv';
const fileName = 'data.csv';

describe('#detectColumnTypes', () => {
  it('should throw an error if not connected to a server',
    browserTest((done, window) => {
      const con = new window.MapdCon();
      try {
        con.detectColumnTypes(fileName, makeCopyParams(window), (tableData) => { /* no-op */ });
      } catch (e) {
        expect(!!e).toEqual(true);
        done();
      }
    })
  );

  xit('sync - should get the field names of the given table',
    browserTest((done, window) => {
      const con = connect(new window.MapdCon());
      const sessionId = con.sessionId()[0];
      uploadFile(sessionId, filePath, (uploadError, res) => {
        const tableData = con.detectColumnTypes(fileName, copyParams);
        const columnHeaders = tableData.row_set.row_desc;
        const rows = tableData.row_set.rows;
          expect(tableData).toBeA(window.TDetectResult);
          expect(columnHeaders).toBeAn('array');
          expect(columnHeaders.length).toBe(19);
          expect(rows.length).toBe(10);
        deleteUploadedFile(sessionId, fileName, (deleteError, res) => {
          expect(res.statusCode).toBe(200);
          done();
        });
      });
    })
  );

  it('async - should get the field names of the given table',
    browserTest((done, window) => {
      const con = connect(new window.MapdCon());
      uploadFile(con.sessionId()[0], filePath, (uploadError, res) => {
        con.detectColumnTypes(fileName, makeCopyParams(window), (tableData) => {
          const columnHeaders = tableData.row_set.row_desc;
          const rows = tableData.row_set.rows;
          expect(tableData).toBeA(window.TDetectResult);
          expect(columnHeaders).toBeAn('array');
          expect(columnHeaders.length).toBe(17);
          expect(rows.length).toBe(11);
          deleteUploadedFile(con.sessionId()[0], fileName, (deleteError, res) => {
            expect(res.statusCode).toBe(200);
            done();
          });
        });
      });
    })
  );
});
