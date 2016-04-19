// TEST SERVER CONNECTION PARAMETERS
process.env.PROTOCOL = 'https';
process.env.HOST = 'kali.mapd.com';
process.env.PORT = 9092;
process.env.DB_NAME = 'mapd';
process.env.USER = 'mapd';
process.env.PASSWORD = 'mapd';

// DO NOT EDIT BELOW THIS LINE
process.env.NODE_ENV = 'test';
process.env.JUNIT_REPORT_PATH = 'mocha-report.xml';
process.env.JUNIT_REPORT_STACK = 1;
