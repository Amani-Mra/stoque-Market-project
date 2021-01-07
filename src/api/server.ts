import * as express from 'express';
import * as helmet from 'helmet';
import * as mongoose from 'mongoose';
import auth from './routes/auth';
import * as jwt from 'jsonwebtoken';

const router = express.Router();
router.use(express.json());
router.use(express.urlencoded({ extended: true }));
router.use(helmet());

const user = process.env.TODO_USER;
const password = process.env.TODO_PASSWORD;
const url = process.env.TODO_URL;
const dbName = process.env.TODO_DB;

mongoose.connect(
  `mongodb+srv://${user}:${password}@${url}/${dbName}?retryWrites=true&w=majority`
);
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET as string,
    (err: any, user: any) => {
      console.log(err);
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    }
  );
}

router.use('/auth', auth);
router.use('data', authenticateToken, () => {});

export default router;
