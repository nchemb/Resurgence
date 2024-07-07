const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const port = 3001;
const server = http.createServer(app);

const mainDomain = process.env.NODE_ENV === 'production' ? 'justintake.com' : 'localhost';

const isAllowedOrigin = (origin) => {
  if (!origin) return true; // Allow non-browser requests

  // Special handling for localhost (development environment)
  if (mainDomain === 'localhost') {
    return origin.startsWith('http://') && (origin.endsWith('.localhost') || origin.endsWith(':3000'));
  }

  // Check if origin is a subdomain of the main domain or is the main domain itself
  const regex = new RegExp(`^(https?:\/\/)?([a-zA-Z0-9-]+\.)*${mainDomain.replace(/\./g, '\\.')}$`);
  return regex.test(origin);
};

// CORS Middleware for Express
app.use(cors({
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// CORS Configuration for Socket.IO
const io = socketIo(server, {
  cors: {
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true
  }
});



// Hashing and token generation settings
const saltRounds = 10;
const jwtSecret = 'test';

const mongoURI = 'mongodb+srv://chembur1:Bearzfan509@cluster0.rmjstry.mongodb.net/MainDB?retryWrites=true&w=majority'
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });



// Increase the limit for the request body size
app.use(bodyParser.json({ limit: '50mb' })); // Adjust the limit according to your needs
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

const Schema = mongoose.Schema;

const patientSchema = new mongoose.Schema({
  formData: mongoose.Schema.Types.Mixed, // Mixed type for dynamic form data
  clientId: String, // To identify which client the patient data belongs to
}, { timestamps: true });

const Patient = mongoose.model('Patient', patientSchema);

//builds the model for User
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true }, // Hashed password
  role: { type: String, required: true } // e.g., 'admin', 'patient'
});
const User = mongoose.model('User', userSchema);
 
//builds the model based off the clientConfig
const clientConfigSchema = new mongoose.Schema({
  clientId: String,
  clientName: String,
  formFields: [{
    field: String,
    label: String,
    type: { type: String },
    required: Boolean,
    options: [String] // for select fields
  }]
});
const ClientConfig = mongoose.model('ClientConfig', clientConfigSchema);



//socket connection
io.on('connection', (socket) => {
  console.log('a user connected');
  
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});


/////* API CALLS */////

//submit button on intake form
app.post('/submit-form', async (req, res) => {
  const newPatient = new Patient({
    formData: req.body, // Store the entire form data
    clientId: req.body.clientId // Assuming client ID is sent in the form data
  });

  try {
    const savedPatient = await newPatient.save();
    io.emit('newPatient', savedPatient);
    res.json({ message: 'Patient added!', patient: savedPatient });
  } catch (error) {
    res.status(400).json('Error: ' + error);
  }
});


//populates the dashboard
app.get('/api/patients', async (req, res) => {
  const clientSubdomain = req.hostname.split('.')[0]; // Assuming format like 'client.yourapp.com'
  
  try {
    const patients = await Patient.find({ clientId: clientSubdomain }).sort({ createdAt: -1 });
    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


//gets patient page
app.get('/api/patients/:id', async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    res.json(patient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update patient information
app.put('/api/patients/:id', async (req, res) => {
  try {
    console.log("Updating patient with ID:", req.params.id);
    const updatedPatient = await Patient.findByIdAndUpdate(req.params.id, {
      formData: req.body.formData
    }, { new: true });
    if (!updatedPatient) {
      return res.status(404).json({ message: "Patient not found" });
    }
    res.json(updatedPatient);
  } catch (error) {
    console.error("Error updating patient:", error);
    res.status(400).json({ message: 'Error updating patient', error });
  }
});

// Delete patient
app.delete('/api/patients/:id', async (req, res) => {
  try {
    const patient = await Patient.findByIdAndDelete(req.params.id);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }
    res.json({ message: 'Patient deleted successfully' });
  } catch (error) {
    console.error("Error deleting patient:", error);
    res.status(500).json({ message: 'Error deleting patient', error });
  }
});

// Login
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    
    if (user && await bcrypt.compare(password, user.password)) {
      // Generate token
      const token = jwt.sign({ username: user.username, role: user.role }, jwtSecret, { expiresIn: '1h' });
      res.json({ token, role: user.role });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error });
  }
});

//get client config
app.get('/api/client-config', async (req, res) => {
  const clientSubdomain = req.hostname.split('.')[0]; // Assuming format like 'client.yourapp.com'

  try {
    const clientConfig = await ClientConfig.findOne({ clientId: clientSubdomain });
    if (clientConfig) {
      res.json(clientConfig);
    } else {
      res.status(404).send('Client configuration not found');
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching client configuration', error });
  }
});



app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
