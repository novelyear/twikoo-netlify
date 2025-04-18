const { MongoClient } = require('mongodb');
const crypto = require('crypto');
const { JSDOM } = require('jsdom');
const createDOMPurify = require('dompurify');

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

exports.handler = async (event, context) => {
  // 确保只接受 POST 请求
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  // 解析请求体
  let requestBody;
  try {
    requestBody = JSON.parse(event.body || '{}');
  } catch (error) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  // 验证参数
  const { content, url, href } = requestBody;
  if (!content) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing required fields: content' }) };
  }

  try {
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    const db = client.db('test');
    const collection = db.collection('comment');

    const commentDo = {
      _id: crypto.randomBytes(16).toString('hex'),
      uid: requestBody.uid || null,
      nick: requestBody.nick,
      mail: '',
      mailMd5: '',
      link: requestBody.link || null,
      ua: requestBody.ua || null,
      ip: '127.0.0.1',
      master: false,
      url: url,
      href: href,
      comment: DOMPurify.sanitize(content, { FORBID_TAGS: ['style'], FORBID_ATTR: ['style'] }),
      pid: null,
      rid: null,
      isSpam: false,
      created: new Date(),
      updated: new Date()
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