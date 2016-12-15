require("babel-register")
// TEST SERVER CONNECTION PARAMETERS
process.env.PROTOCOL = 'http';
process.env.HOST = 'kali.mapd.com';
process.env.PORT = 9092;
process.env.DB_NAME = 'mapd';
process.env.USER = 'mapd';
process.env.PASSWORD = 'HyperInteractive';
process.env.TABLE_NAME = 'contributions';
process.env.UPLOAD_URL = 'http://kali.mapd.com:9092/upload';
process.env.DELETE_URL = 'http://kali.mapd.com:9092/deleteUpload';

// DO NOT EDIT BELOW THIS LINE
process.env.NODE_ENV = 'test';
process.env.JUNIT_REPORT_PATH = 'mocha-report.xml';
process.env.JUNIT_REPORT_STACK = 1;
