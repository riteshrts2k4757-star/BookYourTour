const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const bodyParser = require('body-parser');


const globalErrorHandler = require('./controllers/errorController');



const bookingRouter = require('./routes/bookingRoutes');
const bookingController = require('./controllers/bookingController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const adminRouter = require('./routes/adminRoutes');
const transportRouter = require('./routes/transportRoutes');
// start the express app
const app = express();
const fs = require('fs');

app.use(express.static(path.join(__dirname, 'public')));

const frontendDistPath = path.join(__dirname, '..', 'frontend', 'dist');

if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));

  app.get(/^\/(?!api\/).*/, (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.status(503).json({
      status: 'error',
      message: 'React production files are not built. Run npm run build in frontend/.'
    });
  });
}

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: [
        "'self'",
        "http://127.0.0.1:3000",
        "ws://127.0.0.1:*",
        "https://cdn.jsdelivr.net",
        "https://fonts.googleapis.com",
        "https://fonts.gstatic.com",
        "https://demotiles.maplibre.org",
        "https://*.openstreetmap.org",
        "https://*.tiles.maplibre.org"
      ],
      scriptSrc: ["'self'", "https://cdn.jsdelivr.net", "https://unpkg.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https:", "https://fonts.googleapis.com", "https://unpkg.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: [
        "'self'",
        "data:",
        "blob:",
        "https://*.cartocdn.com",
        "https://images.unsplash.com",
        "https://*.unsplash.com",
        "https://*.openstreetmap.org",
        "https://demotiles.maplibre.org"
      ]
    }
  })
);



if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const limiter = rateLimit({
  max: 1000,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter);

app.post(
  '/api/v1/bookings/webhook',
  bodyParser.raw({ type: 'application/json' }),
  bookingController.webhookCheckout
);
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

app.use(mongoSanitize());

app.use(xss());

app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
);


app.use(compression());

// app.use(express.static(`${__dirname}/public`));

//Test Middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.cookies);
  next();
});

//Router
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/transport', transportRouter);

app.use(globalErrorHandler);

module.exports = app;




// const tours = JSON.parse(
// fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
// );
// const getAllTours = (req, res) => {
//   res.status(200).json({
//     status: 'success',
//     results: tours.length,
//     data: {
//       tours
//     }
//   });
// };

// const getOneTour = (req, res) => {
//   console.log(req.params);
//   const id = req.params.id * 1;
//   const tour = tours.find(el => el.id === id);

//   //if(id>tours.length){
//   if (!tour) {
//     return res.status(404).json({
//       status: 'fail',
//       message: 'Invalid ID'
//     });
//   }

//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour
//     }
//   });
// };

// const createTour = (req, res) => {
//   //console.log(req.body);

//   const newId = tours[tours.length - 1].id + 1;
//   const newTour = Object.assign({ id: newId }, req.body);
//   tours.push(newTour);
//   fs.writeFile(
//     `${__dirname}/dev-data/data/tours-simple.json`,
//     JSON.stringify(tours),
//     err => {
//       res.status(201).json({
//         status: 'success',
//         data: {
//           tours: newTour
//         }
//       });
//     }
//   );
// };

// const updateTour = (req, res) => {
//   if (req.params.id > tours.length) {
//     return res.status(404).json({
//       status: 'fail',
//       message: 'Invalid ID'
//     });
//   }
//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour: '<Updated tour here...>'
//     }
//   });
// };

// const deleteTour = (req, res) => {
//   if (req.params.id > tours.length) {
//     return res.status(404).json({
//       status: 'fail',
//       message: 'Invalid ID'
//     });
//   }
//   res.status(204).json({
//     status: 'success',
//     data: null
//   });
// };
// const getAllUser = (req, res) => {
//   res.status(200).json({
//     status: 'success',
//     results: tours.length,
//     data: {
//       tours
//     }
//   });
// };

// const getUser = (req, res) => {
//   console.log(req.params);
//   const id = req.params.id * 1;
//   const tour = tours.find(el => el.id === id);

//   //if(id>tours.length){
//   if (!tour) {
//     return res.status(404).json({
//       status: 'fail',
//       message: 'Invalid ID'
//     });
//   }

//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour
//     }
//   });
// };

// const createUser = (req, res) => {
//   //console.log(req.body);

//   const newId = tours[tours.length - 1].id + 1;
//   const newTour = Object.assign({ id: newId }, req.body);
//   tours.push(newTour);
//   fs.writeFile(
//     `${__dirname}/dev-data/data/tours-simple.json`,
//     JSON.stringify(tours),
//     err => {
//       res.status(201).json({
//         status: 'success',
//         data: {
//           tours: newTour
//         }
//       });
//     }
//   );
// };

// const updateUser = (req, res) => {
//   if (req.params.id > tours.length) {
//     return res.status(404).json({
//       status: 'fail',
//       message: 'Invalid ID'
//     });
//   }
//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour: '<Updated tour here...>'
//     }
//   });
// };

// const deleteUser = (req, res) => {
//   if (req.params.id > tours.length) {
//     return res.status(404).json({
//       status: 'fail',
//       message: 'Invalid ID'
//     });
//   }
//   res.status(204).json({
//     status: 'success',
//     data: null
//   });
// };
// // app.get('/api/v1/tours',getAllTour);
// // app.post('/api/v1/tours', createTour);
// // app.get('/api/v1/tours/:id', getOneTour);
// // app.patch('/api/v1/tours/:id', updateTour);
// // app.delete('/api/v1/tours/:id', deleteTour);

// const tourRouter = express.Router();
// const userRouter = express.Router();

// app.use('.api/v1/tours', tourRouter);
// app.use('.api/v1/user', userRouter);


// tourRouter
//   .route('/')
//   .get(getAllTours)
//   .post(createTour);

//   tourRouter
//   .route('/:id')
//   .get(getOneTour)
//   .patch(updateTour)
//   .delete(deleteTour);

// userRouter
//   .route('/')
//   .get(getAllUser)
//   .post(createUser);

// userRouter
//   .route('/:id')
//   .get(getUser)
//   .patch(updateUser)
//   .delete(deleteUser);
