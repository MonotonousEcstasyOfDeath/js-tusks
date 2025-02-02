const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');

const secret = require('../conf.js')

const uri = "dbURI";
const client = new MongoClient(uri, { useUnifiedTopology: true}, { useNewUrlParser: true }, { connectTimeoutMS: 30000 }, { keepAlive: 1});

const dbName = 'dbName';


async function loginUser(data) {
  try {

    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection('Users');
    const findUser = await collection.findOne({user: data.email});

    if (findUser !== null) {

      const isPasswordValid = bcrypt.compareSync(data.password, findUser.password);
      if (isPasswordValid) {      

        let access_token = jwt.sign({
          exp: (Math.floor((Date.now() / 1000) + (Math.random() * 30 + 30))),
          data: `{"username": "${findUser.user}", "userId": "${findUser.userId}"}`,
        }, secret);

        let refresh_token = jwt.sign({
          exp: (Math.floor((Date.now() / 1000) + (Math.random() * 60 * 10  + 10 * 60))),
          data: `{"username": "${findUser.user}", "userId": "${findUser.userId}"}`
        }, secret);

        client.close();

        fs.writeFile(`./reqData/${access_token}.txt`, '1', () => {});
  
        return {ref: refresh_token, acc: access_token};
      } else {
        client.close();
        return 'User not found or password is incorrect'
      }
      }      

  }catch(err) {    
    console.log(err);
    client.close();
    return
  }
}


module.exports = loginUser;