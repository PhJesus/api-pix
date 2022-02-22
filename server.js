require('dotenv').config();
const express = require('express');
const app = express();
const PORT = 3000;
const axios = require('axios');
const qs = require('qs');

// Config
app.use(express.static('public'));
app.use('/css',express.static(__dirname + 'public/css'));
app.use('/img',express.static(__dirname + 'public/img'));

// Template engine
app.set('view engine', 'ejs');

// DESCOBRIR COMO TIRAR DATA DAQUI
let data = qs.stringify({
  'grant_type': 'client_credentials',
  'scope': 'cob.read cob.write pix.read pix.write' 
});
let config = {
  method: 'post',
  url: `https://oauth.hm.bb.com.br/oauth/token?${process.env.GW_DEVKEY}`,
  headers: { 
    'Authorization': `${process.env.AUTHORIZATION}`, 
    'Content-Type': 'application/x-www-form-urlencoded', 
    'Cookie': 'JSESSIONID=jHP_g9Izc8-ScnMsFgV8SVxg1MqYkvwdj_YLGuDMfgnKfrvKXBcs!133082940'
  },
  data : data
};

app.get('', (req, res) => {
  res.render('index');
})

app.get('/oauth', (res) => {
  axios(config)
  .then((res) => res.data)
  .then((token) => {
    console.log('Token: ', token)
  })
  .catch((error) => res.statusCode(500).json({ err: err.message}));
});

// GERAR QR CODE
// GERENCIAR PIX RECEBIDOS
// CONSULTAR UM PIX
// CRIAR COBRANÇA PIX
// REVISAR COBRANÇAS


app.listen(PORT, () => console.log(`Servidor iniciado em localhost:${PORT}`))