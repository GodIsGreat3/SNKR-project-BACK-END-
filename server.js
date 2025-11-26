const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const sequelize = require('./src/db');
const userRoutes = require('./src/routes/userRoutes');


dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use('/auth', userRoutes);

app.get('/', (req, res) => res.send('Server is running'));

const PORT = process.env.PORT || 5000;
sequelize.sync().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
