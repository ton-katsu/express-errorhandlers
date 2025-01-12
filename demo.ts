/**
 * Demo Server
 */
import bodyParser from 'body-parser';
import d from 'debug';
import express, { NextFunction, Request, Response } from 'express';
import logger from 'morgan';
const debug = d('express-errorhandlers:demo');
import expressHandlers from './src';

///

const PORT = 3000;
const app = express();

app.use(logger('combined'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));

// tslint:disable-next-line: variable-name
app.get('/', (_req: Request, res: Response, _next: NextFunction) => {
  res.status(200).json({
    'Access URLs': [
      'http://localhost:3000/401',
      'http://localhost:3000/502',
      'http://localhost:3000/500'
    ]
  });
});

// tslint:disable-next-line: variable-name
app.get('/401', (_req: Request, _res: Response, next: NextFunction) => {
  next(new expressHandlers.Handler(undefined, 401, 'Unauthorized', {
    code: 'A-401-000000'
  }));
});

// tslint:disable-next-line: variable-name
app.get('/502', (_req: Request, _res: Response, next: NextFunction) => {
  next(new expressHandlers.Handler(undefined, 502, 'Bad Gateway', {
    code: 'A-502-000000'
  }));
});

// tslint:disable-next-line: variable-name
app.get('/500', (req: Request, _res: Response, next: NextFunction) => {
  next(new Error(`${req.path} Server Error!!`));
});

///
app.use(expressHandlers.middleware.skipOkHandler(
  ['/favicon.ico', '/sitemap.xml'],
  // fn: function() {...}
));

app.use(expressHandlers.middleware.notFound(
  'Not Found :p', {
  message: 'page not found.'
}, {
  env: process.env.NODE_ENV
},
));

app.use(expressHandlers.middleware.errorHandler({
  debug: process.env.NODE_ENV !== 'production',
  extra: { message: 'page server error.' }, // Extended message object
  extraDebug: { env: process.env.NODE_ENV }, // Extended message object (only debug)
  // tslint:disable-next-line: variable-name
  final: (_req, _res, handler) => {
    // console.error('final. error:', handler); // log output
    debug('final call. %O', handler);
  },
  // templateHTML: {...}, // pug template string or pug file path (HTML)
  // templateHTMLOptions: {...}, // pug compile config (HTML)
  // templateTEXT: {...}, // pug template string or pug file path (TEXT)
  // templateTEXTOptions: {...}, // pug compile config (TEXT)
  message: 'Demo Server Error', // default error message
  status: 555, // default response status code
}));

if (process.env.EXPRESS_ERRROHANDLERS_LISTEN) {
  // tslint:disable-next-line: no-console
  app.listen(PORT, () => console.log(`demo app listening on port ${PORT}!`));
}

export default app;
