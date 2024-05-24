require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { MongoClient, ObjectId } = require('mongodb');

const client = new MongoClient(process.env.DB_URL);
const db = client.db("exercise_tracker");
const user = db.collection("user")
const exercise = db.collection("exercise")
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
      username: username,
    };
    const result = await user.insertOne(userDoc);
    res.json({
      username: username,
      _id: result.insertedId,
    });
  });

app.post('/api/users/:id/exercises', async (req, res) => {
    const {id, desc, dur, date} = req.body;

    const getUser = user.find({_id: new ObjectId(id)})[0];

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const exerciseDoc = {
      username: getUser,
      description: desc,
      duration: dur,
      date: date,
      _id: id
    }

    const result = await exercise.insertOne(exerciseDoc);

    console.log(result)
    console.log(user)
    res.json(exerciseDoc.username)
  });

app.get('/api/users/:id/logs', (req, res) => {})


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
