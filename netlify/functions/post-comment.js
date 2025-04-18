const { MongoClient } = require('mongodb');
const crypto = require('crypto');

exports.handler = async (event, context) => {
  // 确保只接受 POST 请求
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  // 解析请求体
  let event = JSON.parse(event.body || '{}');

  // 验证参数
  if (!event) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing event' }) };
  }

  try {
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db('test');
    const collection = db.collection('comment');
    const timestamp = Date.now()
    const commentDo = {
      _id: require('crypto').randomBytes(16).toString('hex'),
      uid: 'deepseek-uid',
      nick: 'DeepSeek',
      mail: '',
      mailMd5: '',
      link: 'https://deepseek.com',
      ua: 'DeepSeek Bot',
      ip: '127.0.0.1',
      master: false,
      url: comment.url,
      href: comment.href,
      comment: DOMPurify.sanitize(comment.comment, { FORBID_TAGS: ['style'], FORBID_ATTR: ['style'] }),
      pid: null,
      rid: null,
      isSpam: false,
      created: timestamp,
      updated: timestamp
    };

    await collection.insertOne(commentDo);
    await client.close();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Comment posted', commentDo })
    };
  } catch (error) {
    console.error('MongoDB error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};