export const html = '<!doctype html><html><body></body></html>';
export const queries = [
  'SELECT count(*) AS n FROM tweets WHERE country=\'CO\'',
  'SELECT country, avg(followers) AS num_followers FROM tweets GROUP BY country',
];
export const uploadUrl = 'http://kali.mapd.com:9092/upload';
export const deleteUploadUrl = 'http://kali.mapd.com:9092/deleteUpload';
