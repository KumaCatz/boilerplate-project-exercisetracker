require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { ObjectId, MongoClient } = require('mongodb');
const mongoose = require('mongoose');
const { Schema } = mongoose;

mongoose.connect(process.env.DB_URL);

const app = express();

const userSchema = new Schema({
  username: String,
});
const User = mongoose.model('User', userSchema);

const exerciseSchema = new Schema({
  user_id: { type: String, required: true },
  description: String,
  duration: Number,
  date: Date,
});
const Exercise = mongoose.model('Exercise', exerciseSchema);

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

app
  .route('/api/users')
  .get(async (req, res) => {
    const cursor = user.find();
    const results = await cursor.toArray();
    res.json(results);
  })
  .post(async (req, res) => {
    const { username } = req.body;

    const user = new User({username: username})
    await user.save()
    // const resultUser = await user.findOne({ username });

    // const addToLog = await log.insertOne({
    //   ...userDoc,
    //   count: 0,
    //   log: [],
    //   _id: resultUser._id,
    // });

    res.json(user);
  });

app.post('/api/users/:id/exercises', async (req, res) => {
  const { description, dur, date } = req.body;
  const { id } = req.params;

  const getUser = await user.findOne({ _id: new ObjectId(id) });

  if (!getUser) {
    return res.status(404).json({ error: 'User not found' });
  }

  let exerciseDate;
  if (date) {
    const parsedDate = new Date(date);
    if (!isNaN(parsedDate)) {
      exerciseDate = parsedDate.toISOString();
    } else {
      res.json({ error: 'invalid date format' });
    }
  } else {
    exerciseDate = new Date().toISOString();
  }

  const exerciseDoc = {
    description,
    duration: +dur,
    date: exerciseDate,
  };

  const result = await exercise.insertOne({
    ...exerciseDoc,
    username: getUser.username,
    _id: new ObjectId(id),
  });

  const addToLog = await log.updateOne(
    { _id: new ObjectId(id) },
    {
      $push: { log: exerciseDoc },
      $inc: { count: 1 },
    }
  );

  res.json({
    ...exerciseDoc,
    username: getUser.username,
    _id: id,
  });
});

app.get('/api/users/:id/logs', async (req, res) => {
  const { id } = req.params;

  const getUser = await log.findOne({ _id: new ObjectId(id) });

  res.json({
    ...getUser,
    _id: id,
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
