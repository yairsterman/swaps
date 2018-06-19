let express = require('express');
let path = require('path');
let favicon = require('serve-favicon');
let logger = require('morgan');
let cookieParser = require('cookie-parser');
let bodyParser = require('body-parser');
let session = require('express-session');
let passport       = require("passport");
let less = require('less');
let fs = require('fs');

let passportService = require('./services/passport');
let emailService = require('./services/email');
let config = require('./config');

let index = require('./routes/index');
let users = require('./routes/user');
let account = require('./routes/account');
let message = require('./routes/message');
let utils = require('./routes/utils');
let transactions = require('./routes/transactions');
let login = require('./routes/login');
let community = require('./routes/community');
let blog = require('./routes/blog');

const app = express();

// view engine setup
app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({ 
    secret: '1234567890',
    cookie: { maxAge: 3600000*24*365 },
    resave: true,
    saveUninitialized: false}));
app.use(passport.initialize());
app.use(passport.session());

// load mongoose package
const mongoose = require('mongoose');
// Use native Node promises
mongoose.Promise = global.Promise;
// connect to MongoDB

// mongoose.connect(config.mongoUrl)
//     .then(() =>  console.log('connection succesful'))
// .catch((err) => console.error(err));

mongoose.connect(config.mongoUrl).then(function () {
    console.log('connection successful');
}).catch(function (err) {
    console.error(err);
});

app.use(function(req, res, next) {
     res.header('Access-Control-Allow-Origin', req.headers.origin);
     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
     next();
});

app.use('/user', users);
app.use('/account', account);
app.use('/message', message);
app.use('/utils', utils);
app.use('/transactions', transactions);
app.use('/auth', login);
app.use('/community', community);
app.use('/blog', blog);
app.use('/', index);

// app.use(bodyParser({uploadDir:'./uploads'}));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err); 
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  console.log(err);
  // render the error page
  res.status(err.status || 500);
  if(err.error){
      res.json(err);
  }
  else{
      res.render('error.html');
  }
});


passportService.init();
emailService.init();

app.listen(3000,function () {
    console.log("listening on 3000");
});

//compile less files

// Load the file, convert to string
fs.readFile( path.join(__dirname, './public/stylesheets/less/main.less'), function (error, data) {
  const dataString = data.toString();
  const options = {
    paths         : [(path.join(__dirname, './public/stylesheets/less'))],      // .less file search paths
    outputDir     : (path.join(__dirname, './public/stylesheets/css')),   // output directory, note the '/'
    optimization  : 1,                // optimization level, higher is better but more volatile - 1 is a good value
    filename      : "main.less",       // root .less file
    compress      : true,             // compress?
    yuicompress   : true              // use YUI compressor?
  }; 
 
  // Create a file name such that
  //  if options.filename == gaf.js and options.compress = true
  //    outputfile = gaf.min.css
  options.outputfile = options.filename.split(".less")[0] + (options.compress ? ".min" : "") + ".css";
  // Resolves the relative output.dir to an absolute one and ensure the directory exist
  options.outputDir = path.resolve( process.cwd(), options.outputDir) + "/";
  ensureDirectory( options.outputDir );
 
  // Create a parser with options, filename is passed even though its loaded
  // to allow less to give us better errors
    const parser = new less.Parser(options);
  parser.parse( dataString, function ( error, cssTree ) {
      if ( error ) {
        less.writeError( error, options );
        return;
      }
 
    // Create the CSS from the cssTree
      const cssString = cssTree.toCSS( {
      compress   : options.compress,
      yuicompress: options.yuicompress
    } );
 
    // Write output
    fs.writeFileSync( options.outputDir + options.outputfile, cssString, 'utf8' );
    console.log("Converted Less: '" + options.filename + "', to CSS: " + options.outputDir + options.outputfile);
  });
});
 
//
const ensureDirectory = function (filepath) {
    const dir = path.dirname(filepath);
    const existsSync = fs.existsSync || path.existsSync;
  if (!existsSync(dir)) { fs.mkdirSync(dir); }
};

module.exports = app;
