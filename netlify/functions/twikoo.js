exports.handler = require('twikoo-netlify').handler

const { MongoClient } = require('mongodb');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { content, postId } = JSON.parse(event.body);

  try {
    const client = new MongoClient(process.env.MONGO_URI);
    await client.connect();
    const db = client.db('twikoo');
    const collection = db.collection('comment');

    const comment = {
      content,
      nick: 'DeepSeek',
      mail: 'deepseek@example.com', // 可选，需与Twikoo配置一致
      link: 'https://deepseek.com',
      ua: 'DeepSeek Bot',
      ip: '127.0.0.1',
      master: false,
      url: `/post/${postId}`, // 对应文章的URL路径
      created: new Date(),
      updated: new Date()
    };

    await collection.insertOne(comment);
    await client.close();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Comment posted' })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};