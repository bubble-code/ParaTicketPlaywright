const app = require('./app');

app.listen(app.get('port'));
console.log('Server initializated in ', app.get('port'));