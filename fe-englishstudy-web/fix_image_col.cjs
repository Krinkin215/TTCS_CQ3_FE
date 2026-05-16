const mysql = require('mysql2/promise');
async function fix() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'phamminhduc2005',
    database: 'englearn'
  });
  await connection.execute('ALTER TABLE topic MODIFY COLUMN image LONGTEXT');
  await connection.execute('ALTER TABLE user MODIFY COLUMN avatar LONGTEXT');
  console.log('Altered successfully');
  await connection.end();
}
fix().catch(console.error);
