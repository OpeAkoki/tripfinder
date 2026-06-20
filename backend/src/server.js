// starts the server
require('dotenv').config({ quiet: true });
const app = require('./app');
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`TripFinder API on http://localhost:${port}`));
