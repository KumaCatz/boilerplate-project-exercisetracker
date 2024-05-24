require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { MongoClient, ObjectId } = require('mongodb');

const client = new MongoClient(process.env.DB_URL);
const db = client.db("exercise_tracker");
const user = db.collection("user")
const exercise = db.collection("exercise")
const log = db.collection("log")
const app = express();

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
    const userDoc = {
      username
    };
    const result = await user.insertOne(userDoc);
    const resultUser = await user.findOne({username});

    const addToLog = await log.insertOne({
      ...userDoc,
      count: 0,
      log: [],
      _id: resultUser._id
    })
    
    res.json({
      username: username,
      _id: result.insertedId,
    });
  });

app.post('/api/users/:id/exercises', async (req, res) => {
    const { description, dur, date} = req.body;
    const {id} = req.params;

    const getUser = await user.findOne({_id: new ObjectId(id)});

    if (!getUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const exerciseDoc = {
      description,
      duration: +dur,
      date: new Date(date).toISOString(),
    }

    const result = await exercise.insertOne({
      ...exerciseDoc,
      username: getUser.username,
      _id: new ObjectId(id)
    });

    const addToLog = await log.updateOne({_id: new ObjectId(id)}, {
      $push: { log: exerciseDoc },
      $inc: { count: 1 }
    })

    res.json({
      ...exerciseDoc,
      _id: id
    })
  });

app.get('/api/users/:id/logs', async (req, res) => {
  const {id} = req.params;

  const getUser = await log.findOne({_id: new ObjectId(id)});

  res.json({
    ...getUser,
    _id: id
  })
})


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
