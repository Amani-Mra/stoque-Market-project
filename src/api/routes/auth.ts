import { User, validate, validateSignIn } from '../models/User';
import * as _ from 'lodash';
import * as express from 'express';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

const router = express.Router();
router.post('/signup', async (req, res) => {
  const body = _.pick(req.body, ['firstName', 'lastName', 'email', 'password']);
  const { error } = validate(body);
  if (error) {
    return res.status(400).send({
      error: error.details.map((v) => {
        return v.message;
      }),
    });
  }
  let user:any = await User.findOne({ email: body.email });
  if (user) return res.status(400).send({ error: 'User already exist' });
  user = new User(body);
  const salt = await bcrypt.genSalt(10);
  user['password'] = await bcrypt.hash(user['password'], salt);
  await user.save();
  return res.send(_.pick(user, ['_id', 'firstName', 'lastName', 'email']));
});
router.post('/signin', async (req, res) => {
  const { error } = validateSignIn(req.body);
  if (error) {
    return res.status(400).send({
      error: error.details.map((v) => {
        return v.message;
      }),
    });
  }
  let user: any = await User.findOne({ email: req.body.email });
  if (!user)
    return res.status(400).send({ error: 'Invalid email or password!' });
  const validPassword = await bcrypt.compare(
    req.body.password,
    user['password']
  );
  if (!validPassword)
    return res.status(400).send({ error: 'Invalid email or password!' });
  return res.send({
    token: jwt.sign(
      _.pick(user, ['_id', 'firstName', 'lastName']),
      <string>process.env.TODO_JWT
    ),
  });
});

export default router;
